import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema/account";
import { categories } from "@/lib/db/schema/categories";
import { eq } from "drizzle-orm";
import { getRecurringTransactions } from "@/lib/services/recurringTransactions";
import RecurringDashboard from "./RecurringDashboard";

export default async function RecurringPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  const [recurringData, userAccounts, userCategories] = await Promise.all([
    getRecurringTransactions(user.id),
    db
      .select({ id: accounts.id, name: accounts.name, type: accounts.type })
      .from(accounts)
      .where(eq(accounts.userId, user.id)),
    db
      .select({
        id: categories.id,
        name: categories.name,
        type: categories.type,
      })
      .from(categories)
      .where(eq(categories.userId, user.id)),
  ]);

  return (
    <RecurringDashboard
      recurringTransactions={recurringData}
      accounts={userAccounts}
      categories={userCategories}
    />
  );
}
