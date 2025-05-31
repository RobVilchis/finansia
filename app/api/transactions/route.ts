import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema/account";
import { categories } from "@/lib/db/schema/categories";
import {
  insertTransactionSchema,
  transactions,
} from "@/lib/db/schema/transactions";
import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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
      .orderBy(desc(transactions.date));

    return NextResponse.json(allTransactions);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch transactions: ${error}` },
      { status: 500 }
    );
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
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const newTransaction = await db
      .insert(transactions)
      .values({
        ...validatedData,
        category: category[0].id,
      })
      .returning();

    return NextResponse.json(newTransaction[0]);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create transaction: ${error}` },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const transactionId = body.id;
  console.log(body);
  // If category is being updated, get the new category ID
  let categoryId = body.category;
  if (body.category && typeof body.category === "string") {
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.name, body.category))
      .limit(1);

    if (!category.length) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    categoryId = category[0].id;
  }

  console.log(categoryId);

  const updatedTransaction = await db
    .update(transactions)
    .set({
      ...body,
      amount: body.amount.toString(),
      category: categoryId,
    })
    .where(eq(transactions.id, transactionId))
    .returning();

  console.log(updatedTransaction);

  if (!updatedTransaction.length) {
    return NextResponse.json(
      { error: "Transaction not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(updatedTransaction[0]);
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const deleted = await db
      .delete(transactions)
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
      deletedId: deleted[0].deletedId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to delete transaction: ${error}` },
      { status: 500 }
    );
  }
}
