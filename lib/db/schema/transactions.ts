import { nanoid } from "@/lib/utils";
import { decimal, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import z from "zod";
import { accounts } from "./account";
import { categories } from "./categories";

export const transactions = pgTable("transactions", {
    id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  date: timestamp("date").notNull().defaultNow(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(), // + = income, - = expense
  type: text("type").notNull(),   // "income", "expense", "transfer"
  category: varchar("category_id").references(() => categories.id),
  description: text("description"),
  sourceAccountId: varchar("source_account_id").references(() => accounts.id),
  targetAccountId: varchar("target_account_id").references(() => accounts.id),
  createdAt: timestamp("created_at").defaultNow()
});


export const insertTransactionSchema = z.object({
  date: z.date(),
  amount: z.string(),
  type: z.string(),
  category: z.string(),
  description: z.string(),
});
