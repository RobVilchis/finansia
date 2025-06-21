import { db } from "@/lib/db";
import { categories, insertCategorySchema } from "@/lib/db/schema/categories";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allCategories = await db
      .select({ name: categories.name, type: categories.type })
      .from(categories)
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
    const body = await request.json();
    const validatedData = insertCategorySchema.parse(body);

    const newCategory = await db
      .insert(categories)
      .values(validatedData)
      .returning();
    return NextResponse.json(newCategory[0]);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create category: ${error}` },
      { status: 500 }
    );
  }
}
