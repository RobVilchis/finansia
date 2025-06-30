import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { transactions } from "@/lib/db/schema/transactions";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestURL = new URL(request.url);
    const params = new URLSearchParams(requestURL.search);

    const startDateStr = params.get("startDate") ?? "";
    const endDateStr = params.get("endDate") ?? "";
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

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

    return NextResponse.json(categorySum);
  } catch {
    return NextResponse.json(
      { error: `Failed to calculate sums` },
      { status: 500 }
    );
  }
}
