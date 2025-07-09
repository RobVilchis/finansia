import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema/account";
import { categories } from "@/lib/db/schema/categories";
import { financialGoals } from "@/lib/db/schema/financial_goals";
import { transactions } from "@/lib/db/schema/transactions";
import { fetchChatTransactions } from "@/lib/fetchTransactions";
import { currentUser } from "@clerk/nextjs/server";
import { and, lte, gte, eq, sql } from "drizzle-orm";

export function getFirst50<T>(list: T[]): T[] {
  return list.length > 20 ? list.slice(0, 20) : list;
}

export function errorHandler(error: unknown) {
  if (error == null) {
    return "unknown error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

export async function fetchUserGoals(userId: string) {
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
      `
    )
    .where(eq(financialGoals.userId, userId))
    .groupBy(financialGoals.id)
    .orderBy(financialGoals.createdAt);

  return allGoals;
}

export async function fetchCategorySum() {
  const user = await currentUser();

  if (!user) {
    return "Unauthorized";
  }

  const endDate = new Date();
  const startDate = new Date(new Date().setDate(endDate.getDate() - 30));

  const categorySum = await db
    .select({
      categoryName: categories.name,
      totalAmount: sql`SUM(${transactions.amount})`.as("total_amount"),
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.category, categories.id))
    .where(
      and(
        eq(transactions.userId, user.id),
        eq(transactions.type, "expense"),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      )
    )
    .groupBy(categories.name)
    .orderBy(sql`SUM(${transactions.amount})`);

  return categorySum;
}

export async function fetchUserAccounts(userId: string) {
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
  `
    )
    .where(eq(accounts.userId, userId))
    .groupBy(accounts.id, accounts.name);

  return allAccounts;
}

export async function fetchAllFinancialData(userId: string) {
  const [transactions, goals, accounts, categorySum] = await Promise.all([
    fetchChatTransactions(userId),
    fetchUserGoals(userId),
    fetchUserAccounts(userId),
    fetchCategorySum(),
  ]);

  return {
    transactions,
    goals,
    accounts,
    categorySum,
  };
}
