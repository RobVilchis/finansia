import { db } from "@/lib/db";
import { statementUploads } from "@/lib/db/schema/statementUploads";
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
    .insert(statementUploads)
    .values({
      userId,
      originalFileName,
      extractedText: extractedText ?? null,
      ...(status ? { status } : {}),
    })
    .returning();

  return inserted
}

export async function updateStatementText(
  statementId: string,
  extractedText: string
) {
  const [updated] = await db
    .update(statementUploads)
    .set({ extractedText })
    .where(eq(statementUploads.id, statementId))
    .returning();

  return updated;
}

export async function updateStatementUploadStatus(
  statementId: string,
  status: StatementStatus
) {
  const [updated] = await db
    .update(statementUploads)
    .set({ status })
    .where(eq(statementUploads.id, statementId))
    .returning();

  return updated;
}

export async function getProcessingStatements(userId: string) {
  const pendingStatements = await db
    .select()
    .from(statementUploads)
    .where(
      and(
        eq(statementUploads.userId, userId),
        eq(statementUploads.status, "processing")
      )
    )
    .orderBy(desc(statementUploads.createdAt));

  return pendingStatements;
}
