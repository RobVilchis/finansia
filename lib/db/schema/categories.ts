import { sql } from "drizzle-orm";
import { index, numeric, text, varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { z } from "zod";
import { nanoid } from "@/lib/utils";
import { users } from "./user";

export const categories = pgTable("categories", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").default("expense").notNull(),
  budget: numeric("budget"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
}, (table) => ([
  index("idx_categories_user_id").on(table.userId),
]));

export const insertCategorySchema = z.object({
  name: z.string(),
  userId: z.string(),
  description: z.string().optional(),
  type: z.enum(["expense", "income"]),
  budget: z.number().nullish(),
});

export type NewCategoryParams = z.infer<typeof insertCategorySchema>;
