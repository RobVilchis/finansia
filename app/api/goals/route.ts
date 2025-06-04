import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema/account";
import { financialGoals } from "@/lib/db/schema/financial_goals";
import { transactions } from "@/lib/db/schema/transactions";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schema for validating goal data
const insertGoalSchema = z.object({
  name: z.string(),
  targetAmount: z.string(),
  targetDate: z.string().optional(),
});

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allGoals = await db
      .select({
        id: financialGoals.id,
        name: financialGoals.name,
        targetAmount: financialGoals.targetAmount,
        targetDate: financialGoals.targetDate,
        accountId: financialGoals.accountId,
        currentAmount: sql`
            COALESCE(SUM(CASE WHEN ${transactions.targetAccountId} = ${financialGoals.accountId} THEN ${transactions.amount} ELSE 0 END), 0)
            -
            COALESCE(SUM(CASE WHEN ${transactions.sourceAccountId} = ${financialGoals.accountId} THEN ${transactions.amount} ELSE 0 END), 0)
        `.as("currentAmount"),
      })
      .from(financialGoals)
      .leftJoin(
        transactions,
        sql`
        ${transactions.targetAccountId} = ${financialGoals.accountId}
        OR
        ${transactions.sourceAccountId} = ${financialGoals.accountId}
        `
      )
      .where(eq(financialGoals.userId, user.id))
      .groupBy(financialGoals.id)
      .orderBy(financialGoals.createdAt);

    return NextResponse.json(allGoals);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch goals: ${error}` },
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
    const validatedData = insertGoalSchema.parse(body);

    const existingAccount = await db
      .select()
      .from(accounts)
      .where(eq(accounts.name, validatedData.name));

    if (existingAccount.length == 0) {
      const account = await db
        .insert(accounts)
        .values({
          name: validatedData.name,
          userId: user.id,
        })
        .returning();

      const newGoal = await db
        .insert(financialGoals)
        .values({
          name: validatedData.name,
          targetAmount: validatedData.targetAmount,
          targetDate: validatedData.targetDate
            ? validatedData.targetDate
            : null,
          accountId: account[0].id,
          userId: user.id,
        })
        .returning();
      return NextResponse.json(newGoal[0]);
    } else {
      return NextResponse.json(
        { error: `Failed to create goal: Account already exists` },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create goal: ${error}` },
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
    const goalId = body.id;

    // First check if the goal belongs to the user
    const existingGoal = await db
      .select()
      .from(financialGoals)
      .where(
        and(eq(financialGoals.id, goalId), eq(financialGoals.userId, user.id))
      )
      .limit(1);

    if (!existingGoal.length) {
      return NextResponse.json(
        { error: "Goal not found or unauthorized" },
        { status: 404 }
      );
    }

    const updatedGoal = await db
      .update(financialGoals)
      .set({
        name: body.name,
        targetAmount: body.targetAmount,
        targetDate: body.targetDate ? body.targetDate : null,
        accountId: body.accountId,
      })
      .where(
        and(eq(financialGoals.id, goalId), eq(financialGoals.userId, user.id))
      )
      .returning();

    if (!updatedGoal.length) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json(updatedGoal[0]);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update goal: ${error}` },
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

    // First check if the goal belongs to the user
    const existingGoal = await db
      .select()
      .from(financialGoals)
      .where(
        and(eq(financialGoals.id, body.id), eq(financialGoals.userId, user.id))
      )
      .limit(1);

    if (!existingGoal.length) {
      return NextResponse.json(
        { error: "Goal not found or unauthorized" },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(financialGoals)
      .where(
        and(eq(financialGoals.id, body.id), eq(financialGoals.userId, user.id))
      )
      .returning({ deletedId: financialGoals.id });

    if (!deleted.length) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Goal deleted successfully",
      deletedId: deleted[0].deletedId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to delete goal: ${error}` },
      { status: 500 }
    );
  }
}
