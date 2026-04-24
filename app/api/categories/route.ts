import { db } from "@/lib/db";
import { categories, insertCategorySchema } from "@/lib/db/schema/categories";
import { transactions } from "@/lib/db/schema/transactions";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const allCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        type: categories.type,
        budget: categories.budget,
        spent: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.as("spent"),
      })
      .from(categories)
      .leftJoin(
        transactions,
        and(
          eq(transactions.category, categories.id),
          eq(transactions.userId, user.id),
          eq(transactions.type, "expense"),
          gte(transactions.date, startOfMonth),
          lte(transactions.date, endOfMonth)
        )
      )
      .where(eq(categories.userId, user.id))
      .groupBy(categories.id, categories.name, categories.type, categories.budget)
      .orderBy(categories.name);

    return NextResponse.json(allCategories);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch categories: ${error}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = insertCategorySchema.parse({
      ...body,
      userId: user.id,
    });

    const newCategory = await db
      .insert(categories)
      .values({
        ...validatedData,
        ...(validatedData.type === "expense"
          ? { budget: validatedData.budget?.toString() }
          : { budget: null }),
      })
      .returning();

    return NextResponse.json(newCategory[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: `Failed to create category: ${error}` },
      { status: 500 }
    );
  }
}
