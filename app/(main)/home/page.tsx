import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema/transactions";
import HomeShell from "@/app/components/HomeShell";
import type { MonthlySummaryItem } from "@/app/components/IncomeExpensesBarChart";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq, gte, lte, sql } from "drizzle-orm";

export default async function DashboardPage() {
  const user = await currentUser();

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  let monthlySummary: MonthlySummaryItem[] = [];

  if (user) {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });
    const windowStart = new Date(months[0].year, months[0].month - 1, 1);
    const windowEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const rows = await db
      .select({
        yearMonth: sql<string>`TO_CHAR(${transactions.date}, 'YYYY-MM')`,
        income: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income'  THEN ${transactions.amount}::numeric ELSE 0 END), 0)`,
        expenses: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount}::numeric ELSE 0 END), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.id),
          gte(transactions.date, windowStart),
          lte(transactions.date, windowEnd)
        )
      )
      .groupBy(sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`);

    const rowMap = new Map(rows.map((r) => [r.yearMonth, r]));
    monthlySummary = months.map(({ year, month }) => {
      const key = `${year}-${String(month).padStart(2, "0")}`;
      const row = rowMap.get(key);
      return {
        month: key,
        income: Number(row?.income ?? 0),
        expenses: Number(row?.expenses ?? 0),
      };
    });
  }

  return (
    <HomeShell
      monthlySummary={monthlySummary}
      startDate={startDate}
      endDate={endDate}
    />
  );
}
