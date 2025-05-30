import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { insertTransactionSchema, transactions } from "@/lib/db/schema/transactions";
import { eq } from "drizzle-orm";
import { categories } from "@/lib/db/schema/categories";
import { nanoid } from "@/lib/utils";

export async function GET() {
  try {
    // Join transactions with categories to get category names
    const allTransactions = await db
      .select({
        id: transactions.id,
        description: transactions.description,
        amount: transactions.amount,
        date: transactions.date,
        type: transactions.type,
        category: categories.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.category, categories.id))
      .orderBy(transactions.date);

    return NextResponse.json(allTransactions);
  } catch (error) {
    return NextResponse.json({ error: `Failed to fetch transactions: ${error}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = insertTransactionSchema.parse(body);

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

    const newTransaction = await db.insert(transactions).values({
      ...validatedData,
      category: category[0].id,
    }).returning();

    return NextResponse.json(newTransaction[0]);
  } catch (error) {
    return NextResponse.json({ error: `Failed to create transaction: ${error}` }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const transactionId = body.id;

    // If category is being updated, get the new category ID
    let categoryId = body.category;
    if (body.category && typeof body.category === 'string') {
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
      categoryId = category[0].id;
    }

    const updatedTransaction = await db.update(transactions)
      .set({
        ...body,
        category: categoryId,
      })
      .where(eq(transactions.id, transactionId))
      .returning();

    if (!updatedTransaction.length) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTransaction[0]);
  } catch (error) {
    return NextResponse.json({ error: `Failed to update transaction: ${error}` }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const deleted = await db.delete(transactions)
      .where(eq(transactions.id, body.id))
      .returning({ deletedId: transactions.id });

    if (!deleted.length) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Transaction deleted successfully",
      deletedId: deleted[0].deletedId
    });
  } catch (error) {
    return NextResponse.json({ error: `Failed to delete transaction: ${error}` }, { status: 500 });
  }
}
