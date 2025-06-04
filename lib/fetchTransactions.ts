import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "./db";
import { accounts } from "./db/schema/account";
import { categories } from "./db/schema/categories";
import { transactions } from "./db/schema/transactions";

export async function fetchChatTransactions(userId: string) {
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
      eq(transactions.sourceAccountId, sourceAccounts.id)
    )
    .leftJoin(
      targetAccounts,
      eq(transactions.targetAccountId, targetAccounts.id)
    )
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date));

  return allTransactions;
}
