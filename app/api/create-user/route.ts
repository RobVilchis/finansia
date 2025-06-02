import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/user";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await currentUser();

  if (!user) return new Response("Unauthorized", { status: 401 });

  const existing = await db.select().from(users).where(eq(users.id, user.id));

  if (existing.length == 0) {
    await db.insert(users).values({
      id: user.id,
      email: user.emailAddresses[0].emailAddress || "",
    });
  }

  return new Response("User OK");
}
