import { eq, sql } from "drizzle-orm";

import { transactions } from "@/lib/db/schema/transactions";
import { accounts } from "@/lib/db/schema/account";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { categories } from "@/lib/db/schema/categories";
import { db } from "@/lib/db";
import { financialGoals } from "@/lib/db/schema/financial_goals";
import DataDashboard from "./DataDashboard";
import {
  getTransactions,
  getUnverifiedTransactions,
  countTransactions,
  type GetTransactionsInput,
  type SortBy,
} from "@/lib/services/transactions";
import { getProcessingStatements } from "@/lib/services/statements";

type SearchParams = {
  tab?: string;
  type?: string;
  category?: string;
  account?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  sort?: string;
  page?: string;
};

const PAGE_SIZE = 20;

const VALID_SORT_VALUES: SortBy[] = ["date_desc", "date_asc", "amount_desc", "amount_asc"];

function parseSearchParams(params: SearchParams, userId: string) {
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const filters: GetTransactionsInput = {
    userId,
    sortBy: VALID_SORT_VALUES.includes(params.sort as SortBy)
      ? (params.sort as SortBy)
      : "date_desc",
    limit: PAGE_SIZE,
    offset,
  };

  if (params.type && ["income", "expense", "transfer"].includes(params.type)) {
    filters.type = params.type as "income" | "expense" | "transfer";
  }
  if (params.category) {
    filters.categoryName = params.category;
  }
  if (params.account) {
    filters.accountName = params.account;
  }
  if (params.description) {
    const escaped = params.description.replace(/[%_]/g, "\\$&");
    filters.description = `%${escaped}%`;
  }
  if (params.startDate && params.endDate) {
    const start = new Date(params.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(params.endDate);
    end.setHours(23, 59, 59, 999);
    filters.startDatetime = start;
    filters.endDatetime = end;
  } else if (params.startDate) {
    const start = new Date(params.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date("2099-12-31");
    filters.startDatetime = start;
    filters.endDatetime = end;
  } else if (params.endDate) {
    const start = new Date("2000-01-01");
    const end = new Date(params.endDate);
    end.setHours(23, 59, 59, 999);
    filters.startDatetime = start;
    filters.endDatetime = end;
  }

  return { filters, page };
}

async function getAccounts(userId: string) {
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
}

async function getGoals(userId: string) {
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
}

async function getCategories(userId: string) {
  return await db
    .select({
      id: categories.id,
      name: categories.name,
      type: categories.type,
    })
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.name);
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const { filters, page } = parseSearchParams(params, user.id);

  const [
    txns,
    totalCount,
    userAccounts,
    goals,
    unverified,
    pendingStatements,
    userCategories,
  ] = await Promise.all([
    getTransactions(filters),
    countTransactions(filters),
    getAccounts(user.id),
    getGoals(user.id),
    getUnverifiedTransactions(user.id),
    getProcessingStatements(user.id),
    getCategories(user.id),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <DataDashboard
      transactions={txns}
      accounts={userAccounts}
      goals={goals}
      unverifiedTransactions={unverified}
      pendingStatements={pendingStatements}
      categories={userCategories}
      currentPage={page}
      totalPages={totalPages}
      totalCount={totalCount}
      activeFilters={{
        type: params.type,
        category: params.category,
        account: params.account,
        startDate: params.startDate,
        endDate: params.endDate,
        description: params.description,
        sort: params.sort || "date_desc",
      }}
    />
  );
}
