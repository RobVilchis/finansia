import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema/account";
import { categories } from "@/lib/db/schema/categories";
import { transactions } from "@/lib/db/schema/transactions";
import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const sourceAccounts = alias(accounts, "sourceAccounts");
  const targetAccounts = alias(accounts, "targetAccounts");

  const [balanceRows, incomeRows, expenseRows, recentRows] = await Promise.all([
    // Total balance across all accounts
    db
      .select({
        total: sql<string>`
          COALESCE(SUM(
            CASE WHEN ${transactions.targetAccountId} = ${accounts.id} THEN ${transactions.amount}::numeric ELSE 0 END
          ), 0)
          -
          COALESCE(SUM(
            CASE WHEN ${transactions.sourceAccountId} = ${accounts.id} THEN ${transactions.amount}::numeric ELSE 0 END
          ), 0)
        `.as("total"),
      })
      .from(accounts)
      .leftJoin(
        transactions,
        sql`${transactions.targetAccountId} = ${accounts.id} OR ${transactions.sourceAccountId} = ${accounts.id}`
      )
      .where(eq(accounts.userId, user.id)),

    // Month income
    db
      .select({ total: sql<string>`COALESCE(SUM(${transactions.amount}::numeric), 0)`.as("total") })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.id),
          eq(transactions.type, "income"),
          gte(transactions.date, startOfMonth),
          lte(transactions.date, endOfMonth)
        )
      ),

    // Month expenses
    db
      .select({ total: sql<string>`COALESCE(SUM(${transactions.amount}::numeric), 0)`.as("total") })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.id),
          eq(transactions.type, "expense"),
          gte(transactions.date, startOfMonth),
          lte(transactions.date, endOfMonth)
        )
      ),

    // Recent transactions (last 5)
    db
      .select({
        id: transactions.id,
        description: transactions.description,
        amount: transactions.amount,
        date: transactions.date,
        type: transactions.type,
        categoryName: categories.name,
        sourceAccountName: sourceAccounts.name,
        targetAccountName: targetAccounts.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.category, categories.id))
      .leftJoin(sourceAccounts, eq(transactions.sourceAccountId, sourceAccounts.id))
      .leftJoin(targetAccounts, eq(transactions.targetAccountId, targetAccounts.id))
      .where(eq(transactions.userId, user.id))
      .orderBy(desc(transactions.date))
      .limit(5),
  ]);

  return NextResponse.json({
    totalBalance: Number(balanceRows[0]?.total ?? 0),
    monthIncome: Number(incomeRows[0]?.total ?? 0),
    monthExpenses: Number(expenseRows[0]?.total ?? 0),
    recentTransactions: recentRows,
  });
}
