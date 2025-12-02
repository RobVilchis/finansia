import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getProcessingStatements } from "@/lib/services/statements";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pendingStatements = await getProcessingStatements(user.id);

    return NextResponse.json(pendingStatements);
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
