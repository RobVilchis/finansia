import { db } from "@/lib/db";
import { statementeUplods } from "@/lib/db/schema/statementUploads";
import { and, eq, desc } from "drizzle-orm";

export type StatementStatus = "uploaded" | "processing" | "ready" | "error";

export type CreateStatementInput = {
  userId: string;
  originalFileName: string;
  extractedText?: string | null;
  status?: StatementStatus;
};

export async function createStatementUpload(input: CreateStatementInput) {
  const { userId, originalFileName, extractedText, status } = input;

  const [inserted] = await db
    .insert(statementeUplods)
    .values({
      userId,
      originalFileName,
      extractedText: extractedText ?? null,
      ...(status ? { status } : {}),
    })
    .returning();

  return inserted;
}

export async function updateStatementUploadStatus(
  statementId: string,
  status: StatementStatus
) {
  const [updated] = await db
    .update(statementeUplods)
    .set({ status })
    .where(eq(statementeUplods.id, statementId))
    .returning();

  return updated;
}

export async function getProcessingStatements(userId: string) {
  const pendingStatements = await db
    .select()
    .from(statementeUplods)
    .where(
      and(
        eq(statementeUplods.userId, userId),
        eq(statementeUplods.status, "processing")
      )
    )
    .orderBy(desc(statementeUplods.createdAt));

  return pendingStatements;
}
