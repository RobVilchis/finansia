import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema/account";
import { transactions } from "@/lib/db/schema/transactions";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const insertAccountSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
});

const updateAccountSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.string().optional(),
});

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allAccounts = await db
      .select({
        id: accounts.id,
        name: accounts.name,
        balance: sql`
        COALESCE(SUM(CASE WHEN ${transactions.targetAccountId} = ${accounts.id} THEN ${transactions.amount} ELSE 0 END), 0)
        -
        COALESCE(SUM(CASE WHEN ${transactions.sourceAccountId} = ${accounts.id} THEN ${transactions.amount} ELSE 0 END), 0)
      `.as("balance"),
      })
      .from(accounts)
      .leftJoin(
        transactions,
        sql`
      ${transactions.targetAccountId} = ${accounts.id}
      OR
      ${transactions.sourceAccountId} = ${accounts.id}
    `
      )
      .where(eq(accounts.userId, user.id))
      .groupBy(accounts.id, accounts.name);

    return NextResponse.json(allAccounts);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch accounts: ${error}` },
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
    const validatedData = insertAccountSchema.parse(body);

    const existingAccount = await db
      .select()
      .from(accounts)
      .where(
        and(eq(accounts.name, validatedData.name), eq(accounts.userId, user.id))
      );

    if (existingAccount.length > 0) {
      return NextResponse.json(
        { error: "Account with this name already exists" },
        { status: 400 }
      );
    }

    const newAccount = await db
      .insert(accounts)
      .values({
        name: validatedData.name,
        type: validatedData.type,
        userId: user.id,
      })
      .returning();

    return NextResponse.json(newAccount[0]);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create account: ${error}` },
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
    const validatedData = updateAccountSchema.parse(body);

    const existingAccount = await db
      .select()
      .from(accounts)
      .where(
        and(eq(accounts.id, validatedData.id), eq(accounts.userId, user.id))
      );

    if (existingAccount.length === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const updatedAccount = await db
      .update(accounts)
      .set({
        name: validatedData.name,
        type: validatedData.type,
      })
      .where(
        and(eq(accounts.id, validatedData.id), eq(accounts.userId, user.id))
      )
      .returning();

    return NextResponse.json(updatedAccount[0]);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update account: ${error}` },
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
    const { id } = z.object({ id: z.string() }).parse(body);

    const existingAccount = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)));

    if (existingAccount.length === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    await db
      .delete(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to delete account: ${error}` },
      { status: 500 }
    );
  }
}
