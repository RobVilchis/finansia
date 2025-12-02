import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getUnverifiedTransactions } from "@/lib/services/transactions";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unverifiedTransactions = await getUnverifiedTransactions(user.id);

    return NextResponse.json(unverifiedTransactions);
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
