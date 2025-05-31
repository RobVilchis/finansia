import { nanoid } from "@/lib/utils";
import { date, decimal, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { accounts } from "./account";

export const financialGoals = pgTable("financial_goals", {
    id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  // userId: uuid("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  targetDate: date("target_date"),
  accountId: varchar("account_id").references(() => accounts.id).unique(), // ← one-to-one
  createdAt: timestamp("created_at").defaultNow()
});