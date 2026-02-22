import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import {
  getProcessingStatements,
  updateStatementUploadStatus,
} from "@/lib/services/statements";

const STALE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pendingStatements = await getProcessingStatements(user.id);

    const now = new Date();
    const stale = pendingStatements.filter((stmt) => {
      if (!stmt.createdAt) return false;
      return now.getTime() - stmt.createdAt.getTime() > STALE_THRESHOLD_MS;
    });

    if (stale.length > 0) {
      console.warn(
        `Marking ${stale.length} stale statement(s) as error:`,
        stale.map((s) => s.id)
      );
      await Promise.all(
        stale.map((stmt) => updateStatementUploadStatus(stmt.id, "error"))
      );
    }

    const active = pendingStatements.filter(
      (stmt) =>
        !stmt.createdAt ||
        now.getTime() - stmt.createdAt.getTime() <= STALE_THRESHOLD_MS
    );

    return NextResponse.json(active);
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
