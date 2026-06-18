import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema/account";
import { categories } from "@/lib/db/schema/categories";
import { transactions } from "@/lib/db/schema/transactions";
import { users } from "@/lib/db/schema/user";
import HomeShell from "@/app/components/HomeShell";
import type { MonthlySummaryItem } from "@/app/components/IncomeExpensesBarChart";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq, gte, lte, sql } from "drizzle-orm";

export default async function DashboardPage() {
  const user = await currentUser();

  if (user) {
    const existing = await db.select().from(users).where(eq(users.id, user.id));
    if (existing.length === 0) {
      await db.insert(users).values({
        id: user.id,
        email: user.emailAddresses[0].emailAddress || "",
      });
      await db.insert(accounts).values([
        { userId: user.id, name: "Tarjeta" },
        { userId: user.id, name: "Efectivo" },
      ]);
      await db.insert(categories).values([
        { userId: user.id, name: "Alimentación" },
        { userId: user.id, name: "Transporte" },
        { userId: user.id, name: "Vivienda" },
        { userId: user.id, name: "Salud" },
        { userId: user.id, name: "Educación" },
        { userId: user.id, name: "Ocio" },
        { userId: user.id, name: "Servicios" },
        { userId: user.id, name: "Restaurantes" },
        { userId: user.id, name: "Telefonía" },
        { userId: user.id, name: "Higiene" },
        { userId: user.id, name: "Familia" },
        { userId: user.id, name: "Ropa" },
        { userId: user.id, name: "Otros" },
        { userId: user.id, name: "Sueldo", type: "income" },
      ]);
    }
  }

  const now = new Date();

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

  return <HomeShell monthlySummary={monthlySummary} />;
}
