import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "@/lib/utils";
import { categories } from "@/lib/db/schema/categories";

export async function GET() {
  try {
    // Join expenses with categories to get category names
    const allExpenses = await db
      .select({
        id: expenses.id,
        concept: expenses.concept,
        amount: expenses.amount,
        date: expenses.date,
        categoryName: categories.name,
      })
      .from(expenses)
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .orderBy(expenses.date);

    return NextResponse.json(allExpenses);
  } catch (error) {
    return NextResponse.json({ error: `Failed to fetch expenses: ${error}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Find the category ID based on the category name
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.name, body.category))
      .limit(1);

    if (!category.length) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    const newExpense = await db.insert(expenses).values({
      id: nanoid(),
      concept: body.concept,
      amount: body.amount.toString(),
      categoryId: category[0].id,
      date: new Date(body.date).toISOString(),
    }).returning();

    return NextResponse.json(newExpense[0]);
  } catch (error) {
    return NextResponse.json({ error: `Failed to create expense ${error}` }, { status: 500 });
  }
} 

export async function PATCH(request: Request) {
    const body = await request.json()

    const expenseId = body.id

    console.log(expenseId)

    const updatedExpense = await db.update(expenses)
        .set(body)
        .where(eq(expenses.id, body.id))
        .returning({ updatedId: expenses.id })

    return NextResponse.json(updatedExpense[0])
}

export async function DELETE(request: Request) {
    const body = await request.json()

    const deleted = await db.delete(expenses)
        .where(eq(expenses.id, body.id))
        .returning({ deletedId: expenses.id })

    if (!deleted.length) {
        return new Response(JSON.stringify({ error: 'Expense not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    return new Response(JSON.stringify({ message: 'Expense deleted successfully', deletedId: deleted[0].deletedId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    })}
