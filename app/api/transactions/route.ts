import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema/account";
import { categories } from "@/lib/db/schema/categories";
import {
  insertTransactionSchema,
  transactions,
} from "@/lib/db/schema/transactions";
import { and, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      .where(eq(transactions.userId, user.id))
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
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    body.amount = body.amount.toString();

    // Parse the UTC string and create a Date object that preserves UTC
    const utcDate = new Date(body.date);
    body.date = new Date(
      utcDate.getTime() + utcDate.getTimezoneOffset() * 60000
    );

    const validatedData = insertTransactionSchema.parse({
      ...body,
      userId: user.id,
    });

    // Find the category ID based on the category name if it's not a transfer
    let categoryId = null;
    if (body.type !== "transfer" && body.category) {
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

    const newTransaction = await db
      .insert(transactions)
      .values({
        ...validatedData,
        amount: body.amount.toString(),
        category: categoryId,
        userId: user.id,
        sourceAccountId:
          body.type === "transfer"
            ? body.accountId
            : body.type === "expense"
            ? body.accountId
            : null,
        targetAccountId:
          body.type === "transfer"
            ? body.targetAccountId
            : body.type === "income"
            ? body.accountId
            : null,
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
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const transactionId = body.id;

    const utcDate = new Date(body.date);
    body.date = new Date(
      utcDate.getTime() + utcDate.getTimezoneOffset() * 60000
    );

    // First check if the transaction belongs to the user
    const existingTransaction = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, user.id)
        )
      )
      .limit(1);

    if (!existingTransaction.length) {
      return NextResponse.json(
        { error: "Transaction not found or unauthorized" },
        { status: 404 }
      );
    }

    // If category is being updated, get the new category ID
    let categoryId = body.category;
    if (
      body.type !== "transfer" &&
      body.category &&
      typeof body.category === "string"
    ) {
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
    if (body.type == "transfer") {
      categoryId = null;
    }

    console.log(categoryId);

    const updatedTransaction = await db
      .update(transactions)
      .set({
        ...body,
        amount: body.amount.toString(),
        category: categoryId,
        sourceAccountId:
          body.type === "transfer"
            ? body.accountId
            : body.type === "expense"
            ? body.accountId
            : null,
        targetAccountId:
          body.type === "transfer"
            ? body.targetAccountId
            : body.type === "income"
            ? body.accountId
            : null,
      })
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, user.id)
        )
      )
      .returning();

    if (!updatedTransaction.length) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTransaction[0]);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: `Failed to update transaction: ${error}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // First check if the transaction belongs to the user
    const existingTransaction = await db
      .select()
      .from(transactions)
      .where(
        and(eq(transactions.id, body.id), eq(transactions.userId, user.id))
      )
      .limit(1);

    if (!existingTransaction.length) {
      return NextResponse.json(
        { error: "Transaction not found or unauthorized" },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(transactions)
      .where(
        and(eq(transactions.id, body.id), eq(transactions.userId, user.id))
      )
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
