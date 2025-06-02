import { transactions } from "@/lib/db/schema/transactions";
import { db } from "../lib/db";
import { accounts } from "../lib/db/schema/account";
import { isNull } from "drizzle-orm";

async function main() {
  await db
    .update(accounts)
    .set({
      userId: "user_2xvY8clJbBXGqbPFSYZFDKjEsCm",
    })
    .where(isNull(accounts.userId));

  await db
    .update(transactions)
    .set({
      userId: "user_2xvY8clJbBXGqbPFSYZFDKjEsCm",
    })
    .where(isNull(transactions.userId));
  console.log("✅ Populated status column for existing users.");
}

main().catch((err) => {
  console.error("❌ Failed to populate status column:", err);
});
