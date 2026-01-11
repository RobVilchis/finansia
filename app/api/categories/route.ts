import { db } from "@/lib/db";
import { categories, insertCategorySchema } from "@/lib/db/schema/categories";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        type: categories.type,
      })
      .from(categories)
      .where(eq(categories.userId, user.id))
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
