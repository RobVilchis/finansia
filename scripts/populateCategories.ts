import { categories } from "@/lib/db/schema/categories";
import { users } from "@/lib/db/schema/user";
import { and, eq, ne, or } from "drizzle-orm";
import { db } from "../lib/db";

import { transactions } from "@/lib/db/schema/transactions";

async function main() {
  try {
    const initialCategories = await db
      .select({
        name: categories.name,
        id: categories.id,
        type: categories.type,
      })
      .from(categories);

    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
      })
      .from(users);

    for (const user of allUsers) {
      await Promise.all(
        initialCategories.map((cat) =>
          db.insert(categories).values({
            userId: user.id,
            name: cat.name,
            type: cat.type,
          })
        )
      );
    }

    const allTransactions = await db
      .select({
        id: transactions.id,
        categoryName: categories.name,
        userId: users.id,
      })
      .from(transactions)
      .where(
        or(eq(transactions.type, "expense"), eq(transactions.type, "income"))
      )
      .leftJoin(categories, eq(transactions.category, categories.id))
      .leftJoin(users, eq(transactions.userId, users.id));

    await Promise.all(
      allTransactions.map(async (transaction) => {
        const newCategory = await db
          .select({
            name: categories.name,
            id: categories.id,
            userId: users.id,
          })
          .from(categories)
          .where(
            and(
              eq(users.id, transaction.userId!),
              eq(categories.name, transaction.categoryName!)
            )
          )
          .leftJoin(users, eq(categories.userId, users.id));

        console.log(transaction.categoryName, transaction.userId, transaction);
        console.log(
          `Created category ${newCategory[0].id} for ${newCategory[0].userId}`
        );

        await db
          .update(transactions)
          .set({
            category: newCategory[0].id,
          })
          .where(eq(transactions.id, transaction.id));
      })
    );
  } catch (error) {
    console.error("❌ Failed to populate categories:", error);
    throw error;
  }
}

main().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
