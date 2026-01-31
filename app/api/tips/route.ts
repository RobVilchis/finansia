import { db } from "@/lib/db";
import { financialTips } from "@/lib/db/schema/financial_tips";
import { currentUser } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const maxDuration = 300;

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tips = await db
      .select({
        id: financialTips.id,
        userId: financialTips.userId,
        month: financialTips.month,
        category: financialTips.category,
        title: financialTips.title,
        fullText: financialTips.fullText,
        generatedAt: financialTips.generatedAt,
        source: financialTips.source,
      })
      .from(financialTips)
      .where(eq(financialTips.userId, user.id))
      .orderBy(desc(financialTips.generatedAt));

    return NextResponse.json(tips);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch tips: ${error}` },
      { status: 500 }
    );
  }
}
