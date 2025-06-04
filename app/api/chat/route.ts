import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema/account";
import { financialGoals } from "@/lib/db/schema/financial_goals";
import { transactions } from "@/lib/db/schema/transactions";
import { fetchChatTransactions } from "@/lib/fetchTransactions";
import { openai } from "@ai-sdk/openai";
import { currentUser } from "@clerk/nextjs/server";
import { streamText } from "ai";
import { eq, sql } from "drizzle-orm";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

function getFirst50<T>(list: T[]): T[] {
  return list.length > 20 ? list.slice(0, 20) : list;
}

function errorHandler(error: unknown) {
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

async function fetchUserGoals(userId: string) {
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

async function fetchUserAccounts(userId: string) {
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

export async function POST(req: Request) {
  const { messages } = await req.json();

  const user = await currentUser();

  if (!user) return new Response("Unauthorized", { status: 401 });

  const [transactions, goals, accounts] = await Promise.all([
    fetchChatTransactions(user.id),
    fetchUserGoals(user.id),
    fetchUserAccounts(user.id),
  ]);

  const lastTransactions = getFirst50(transactions);

  const systemContext = `
  You are an expert financial advisor. You are given a list of transactions (income/expenses), financial goals, and accounts information. You need to answer any questions or advice the user may ask in an honest and concise way. The information provided is already known by the user, so don't repeat it back, except for important details. Request any additional information you need from the user.

  Here are the last transactions made by the user:
  ${JSON.stringify(lastTransactions)}

  Here are the user's financial goals:
  ${JSON.stringify(goals)}

  Here are the user's accounts and their current balances:
  ${JSON.stringify(accounts)}
  `;

  const result = streamText({
    model: openai("gpt-4o"),
    system: systemContext,
    messages,
  });

  return result.toDataStreamResponse({
    getErrorMessage: errorHandler,
  });
}
