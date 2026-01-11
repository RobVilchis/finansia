import { sql } from "drizzle-orm";
import { numeric, text, varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
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
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

export const insertCategorySchema = z.object({
  name: z.string(),
  userId: z.string(),
  description: z.string().optional(),
  type: z.enum(["expense", "income"]),
  budget: z.number().nullish(),
});

export type NewCategoryParams = z.infer<typeof insertCategorySchema>;
