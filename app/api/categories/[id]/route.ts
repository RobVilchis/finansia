import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/categories";
import { transactions } from "@/lib/db/schema/transactions";
import { accounts } from "@/lib/db/schema/account";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: categoryId } = await params;

    // Get the category
    const category = await db
      .select({
        id: categories.id,
        name: categories.name,
        type: categories.type,
      })
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, user.id)))
      .limit(1);

    if (!category.length) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Get transactions for this category
    const sourceAccounts = alias(accounts, "sourceAccounts");
    const targetAccounts = alias(accounts, "targetAccounts");

    const categoryTransactions = await db
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
          eq(transactions.category, categoryId),
          eq(transactions.userId, user.id)
        )
      )
      .orderBy(desc(transactions.date));

    // Calculate summary statistics
    const totalAmount = categoryTransactions.reduce((sum, transaction) => {
      if (category[0].type === "expense") {
        return sum + Number(transaction.amount);
      } else if (category[0].type === "income") {
        return sum + Number(transaction.amount);
      }
      return sum;
    }, 0);

    const response = {
      category: category[0],
      transactions: categoryTransactions,
      summary: {
        totalAmount,
        transactionCount: categoryTransactions.length,
        averageAmount:
          categoryTransactions.length > 0
            ? totalAmount / categoryTransactions.length
            : 0,
        lastTransactionDate:
          categoryTransactions.length > 0 ? categoryTransactions[0].date : null,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch category: ${error}` },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: categoryId } = await params;

    const body = await request.json();
    const { name, type } = body;

    // Update the category
    const updatedCategory = await db
      .update(categories)
      .set({ name, type })
      .where(and(eq(categories.id, categoryId), eq(categories.userId, user.id)))
      .returning();

    if (!updatedCategory.length) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCategory[0]);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update category: ${error}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: categoryId } = await params;

    // Check if category has transactions
    const existingTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.category, categoryId),
          eq(transactions.userId, user.id)
        )
      )
      .limit(1);

    if (existingTransactions.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with existing transactions" },
        { status: 400 }
      );
    }

    // Delete the category
    const deletedCategory = await db
      .delete(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, user.id)))
      .returning();

    if (!deletedCategory.length) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to delete category: ${error}` },
      { status: 500 }
    );
  }
}
