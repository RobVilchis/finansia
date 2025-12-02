import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema/account";
import { categories } from "@/lib/db/schema/categories";
import { transactions } from "@/lib/db/schema/transactions";
import { createTransaction } from "@/lib/services/transactions";
import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";

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
      .where(
        and(
          eq(transactions.userId, user.id),
          eq(transactions.isUnverified, false)
        )
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
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const created = await createTransaction({
      userId: user.id,
      description: body.description,
      amount: body.amount,
      type: body.type,
      date: body.date,
      categoryName: body.category, // provided as name in existing API
      accountId: body.accountId,
      accountName: body.accountName,
      targetAccountId: body.targetAccountId,
      targetAccountName: body.targetAccountName,
    });

    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create transaction: ${error}` },
      { status: 500 }
    );
  }
}

interface TransactionUpdateInput {
  description: string;
  date: Date;
  amount: number;
  type: string;
  category: string | null;
  sourceAccountId: string | null;
  targetAccountId: string | null;
  isUnverified?: boolean;
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
        .where(
          and(
            eq(categories.name, body.category),
            eq(categories.userId, user.id)
          )
        )
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

    const updateData: TransactionUpdateInput = {
      description: body.description,
      date: body.date,
      amount: body.amount,
      type: body.type,
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
          ? body.targetAccountId
          : null,
    };

    if (body.isUnverified !== undefined) {
      updateData.isUnverified = body.isUnverified;
    }

    const updatedTransaction = await db
      .update(transactions)
      .set({ ...updateData, amount: updateData.amount?.toString() })
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
