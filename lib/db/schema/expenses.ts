import { sql } from "drizzle-orm";
import {
  text,
  varchar,
  timestamp,
  pgTable,
  numeric,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { nanoid } from "@/lib/utils";
import { categories } from "./categories";

export const expenses = pgTable("expenses", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  concept: text("concept").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  categoryId: varchar("category_id", { length: 191 })
    .notNull()
    .references(() => categories.id),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for expenses - used to validate API requests
export const insertExpenseSchema = z.object({
  concept: z.string(),
  amount: z.number().positive(),
  categoryId: z.string(),
  date: z.string().or(z.date()),
});

// Type for expenses - used to type API request params and within Components
export type NewExpenseParams = z.infer<typeof insertExpenseSchema>;
