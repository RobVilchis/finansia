import { nanoid } from "@/lib/utils";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./user";

export const financialTips = pgTable("financial_tips", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  month: text("month").notNull(), // e.g., "2025-05"
  category: text("category"), // optional: "spending", "goals", etc.
  title: text("title").notNull(), // optional short label
  fullText: text("full_text").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow(),
  source: text("source").default("openai"),
});
