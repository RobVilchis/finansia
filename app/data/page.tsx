import { eq, and, desc, sql } from "drizzle-orm";

import { transactions } from "@/lib/db/schema/transactions";
import { accounts } from "@/lib/db/schema/account";
import { currentUser } from "@clerk/nextjs/server";
import { alias } from "drizzle-orm/pg-core";
import { redirect } from "next/navigation";
import { categories } from "@/lib/db/schema/categories";
import { db } from "@/lib/db";
import { financialGoals } from "@/lib/db/schema/financial_goals";
import { unstable_cache } from "next/cache";
import DataDashboard from "./DataDashboard";
import { getUnverifiedTransactions } from "@/lib/services/transactions";
import { getProcessingStatements } from "@/lib/services/statements";

const getTransactions = unstable_cache(
  async (userId: string) => {
    const sourceAccounts = alias(accounts, "sourceAccounts");
    const targetAccounts = alias(accounts, "targetAccounts");

    const allTransactions = await db
      .select({
        id: transactions.id,
        description: transactions.description,
        amount: transactions.amount,
        date: transactions.date,
        type: transactions.type,
        categoryName: categories.name,
        sourceAccountId: transactions.sourceAccountId,
        targetAccountId: transactions.targetAccountId,
        sourceAccountName: sourceAccounts.name,
        targetAccountName: targetAccounts.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.category, categories.id))
      .leftJoin(
        sourceAccounts,
        eq(transactions.sourceAccountId, sourceAccounts.id),
      )
      .leftJoin(
        targetAccounts,
        eq(transactions.targetAccountId, targetAccounts.id),
      )
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.isUnverified, false),
        ),
      )
      .orderBy(desc(transactions.date));

    return allTransactions;
  },
  ["transactions", process.env.DATABASE_URL || ""],
  { tags: ["transactions"] },
);

const getAccounts = unstable_cache(
  async (userId: string) => {
    const allAccounts = await db
      .select({
        id: accounts.id,
        name: accounts.name,
        balance: sql`
      COALESCE(SUM(CASE WHEN ${transactions.targetAccountId} = ${accounts.id} THEN ${transactions.amount} ELSE 0 END), 0)
      -
      COALESCE(SUM(CASE WHEN ${transactions.sourceAccountId} = ${accounts.id} THEN ${transactions.amount} ELSE 0 END), 0)
    `.as("balance"),
      })
      .from(accounts)
      .leftJoin(
        transactions,
        sql`
          ${transactions.targetAccountId} = ${accounts.id}
          OR
          ${transactions.sourceAccountId} = ${accounts.id}
        `,
      )
      .where(eq(accounts.userId, userId))
      .groupBy(accounts.id, accounts.name);

    return allAccounts.map((account) => ({
      ...account,
      balance: Number(account.balance),
    }));
  },
  ["accounts", process.env.DATABASE_URL || ""],
  { tags: ["accounts"] },
);

const getGoals = unstable_cache(
  async (userId: string) => {
    const allGoals = await db
      .select({
        id: financialGoals.id,
        name: financialGoals.name,
        targetAmount: financialGoals.targetAmount,
        targetDate: financialGoals.targetDate,
        accountId: financialGoals.accountId,
        currentAmount: sql`
            COALESCE(SUM(CASE WHEN ${transactions.targetAccountId} = ${financialGoals.accountId} THEN ${transactions.amount} ELSE 0 END), 0)
            -
            COALESCE(SUM(CASE WHEN ${transactions.sourceAccountId} = ${financialGoals.accountId} THEN ${transactions.amount} ELSE 0 END), 0)
        `.as("currentAmount"),
      })
      .from(financialGoals)
      .leftJoin(
        transactions,
        sql`
        ${transactions.targetAccountId} = ${financialGoals.accountId}
        OR
        ${transactions.sourceAccountId} = ${financialGoals.accountId}
        `,
      )
      .where(eq(financialGoals.userId, userId))
      .groupBy(financialGoals.id)
      .orderBy(financialGoals.createdAt);

    return allGoals.map((goal) => ({
      id: goal.id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: String(goal.currentAmount),
      targetDate: goal.targetDate ?? undefined,
    }));
  },
  ["goals", process.env.DATABASE_URL || ""],
  { tags: ["goals"] },
);

const getUnverified = unstable_cache(
  async (userId: string) => {
    return await getUnverifiedTransactions(userId);
  },
  ["unverified", process.env.DATABASE_URL || ""],
  { tags: ["unverified"] },
);

const getPendingStatements = unstable_cache(
  async (userId: string) => {
    return await getProcessingStatements(userId);
  },
  ["pending-statements", process.env.DATABASE_URL || ""],
  { tags: ["pending-statements"] },
);

export default async function Page() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const [transactions, accounts, goals, unverified, pendingStatements] =
    await Promise.all([
      getTransactions(user.id),
      getAccounts(user.id),
      getGoals(user.id),
      getUnverified(user.id),
      getPendingStatements(user.id),
    ]);

  return (
    <DataDashboard
      transactions={transactions}
      accounts={accounts}
      goals={goals}
      unverifiedTransactions={unverified}
      pendingStatements={pendingStatements}
    />
  );
}
