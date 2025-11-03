import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema/account";
import { categories } from "@/lib/db/schema/categories";
import {
  insertTransactionSchema,
  transactions,
} from "@/lib/db/schema/transactions";
import { and, between, eq, like, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

type TransactionType = "income" | "expense" | "transfer";

export type CreateTransactionInput = {
  userId: string;
  description: string;
  amount: number | string;
  type: TransactionType;
  date: string | Date;
  time?: string; // optional HH:mm or HH:mm:ss, used mainly by chat tool
  categoryName?: string; // category by name (non-transfer)
  categoryId?: string | null; // or category by id
  accountId?: string; // source for expense/transfer, target for income if target not given
  accountName?: string; // alternative to accountId
  targetAccountId?: string; // target for transfer or income
  targetAccountName?: string; // alternative to targetAccountId
};

export type GetTransactionsInput = {
  userId: string;
  description?: string;
  amount?: number | string;
  type?: TransactionType;
  startDatetime?: Date;
  endDatetime?: Date;
  categoryName?: string; // category by name (non-transfer)
  accountName?: string; // alternative to accountId
  targetAccountName?: string; // alternative to targetAccountId
};

function normalizeDate(date: string | Date, time?: string): Date {
  const base = typeof date === "string" ? new Date(date) : date;
  if (time) {
    const [h, m = "0", s = "0"] = time.split(":");
    const dateWithTime = new Date(base);
    dateWithTime.setHours(Number(h), Number(m), Number(s), 0);
    // Convert to UTC equivalent by removing timezone offset
    const utc = new Date(
      dateWithTime.getTime() + dateWithTime.getTimezoneOffset() * 60000
    );
    return utc;
  }
  // Keep parity with existing POST handler which normalizes to UTC
  return new Date(base.getTime() + base.getTimezoneOffset() * 60000);
}

async function resolveAccountId(
  userId: string,
  opts: { accountId?: string; accountName?: string }
): Promise<string | null> {
  if (opts.accountId) return opts.accountId;
  if (!opts.accountName) return null;
  const rows = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(
      and(eq(accounts.userId, userId), eq(accounts.name, opts.accountName))
    )
    .limit(1);
  return rows.length ? rows[0].id : null;
}

async function resolveCategoryId(
  userId: string,
  type: TransactionType,
  categoryName?: string | null,
  categoryId?: string | null
): Promise<string | null> {
  if (type === "transfer") return null;
  if (categoryId) return categoryId;
  if (!categoryName) return null;
  const rows = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(eq(categories.userId, userId), eq(categories.name, categoryName))
    )
    .limit(1);
  return rows.length ? rows[0].id : null;
}

export async function createTransaction(input: CreateTransactionInput) {
  const {
    userId,
    description,
    amount,
    type,
    date,
    time,
    categoryName,
    categoryId: providedCategoryId,
    accountId,
    accountName,
    targetAccountId,
    targetAccountName,
  } = input;

  const normalizedDate = normalizeDate(date, time);
  const amountAsString =
    typeof amount === "number" ? amount.toString() : amount;

  const resolvedCategoryId = await resolveCategoryId(
    userId,
    type,
    categoryName,
    providedCategoryId ?? null
  );

  if (type !== "transfer" && !resolvedCategoryId) {
    throw new Error("Invalid or unknown category");
  }

  const resolvedSourceAccountId = await resolveAccountId(userId, {
    accountId,
    accountName,
  });

  const resolvedTargetAccountId = await resolveAccountId(userId, {
    accountId: targetAccountId,
    accountName: targetAccountName,
  });

  // Build DB values depending on type
  const sourceAccountId =
    type === "transfer"
      ? resolvedSourceAccountId
      : type === "expense"
      ? resolvedSourceAccountId
      : null;
  const finalTargetAccountId =
    type === "transfer"
      ? resolvedTargetAccountId
      : type === "income"
      ? resolvedTargetAccountId ?? resolvedSourceAccountId ?? null
      : null;

  const base = insertTransactionSchema.parse({
    userId,
    date: normalizedDate,
    amount: amountAsString,
    type,
    category: resolvedCategoryId ?? "",
    description,
  });

  const inserted = await db
    .insert(transactions)
    .values({
      ...base,
      amount: amountAsString,
      category: type === "transfer" ? null : resolvedCategoryId,
      sourceAccountId,
      targetAccountId: finalTargetAccountId,
      userId,
    })
    .returning();

  return inserted[0];
}

export async function getTransactions(filters: GetTransactionsInput) {
  const sourceAccounts = alias(accounts, "sourceAccounts");
  const targetAccounts = alias(accounts, "targetAccounts");
  console.log("retrieve filters", filters);

  const conditions = [];
  if (filters.userId) {
    conditions.push(eq(transactions.userId, filters.userId));
  }
  if (filters.description) {
    conditions.push(like(transactions.description, filters.description));
  }
  if (filters.categoryName) {
    conditions.push(like(categories.name, filters.categoryName));
  }
  if (filters.type) {
    conditions.push(eq(transactions.type, filters.type));
  }
  if (filters.startDatetime && filters.endDatetime) {
    conditions.push(
      between(transactions.date, filters.startDatetime, filters.endDatetime)
    );
  }
  if (filters.targetAccountName) {
    conditions.push(like(targetAccounts.name, filters.targetAccountName));
  }
  if (filters.accountName) {
    conditions.push(like(sourceAccounts.name, filters.accountName));
  }

  const query = conditions.length
    ? db
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
        .where(and(...conditions))
    : db.select().from(transactions);
  return await query;
}

export async function deleteTransactions(filters: GetTransactionsInput) {
  // First get the transaction IDs that match the criteria
  const matchingTransactions = await getTransactions(filters);
  const transactionIds = matchingTransactions.map((t) => t.id);
  if (transactionIds.length === 0) {
    return [];
  }

  // Delete transactions by their IDs
  const deleted = await db
    .delete(transactions)
    .where(inArray(transactions.id, transactionIds));

  return deleted;
}
