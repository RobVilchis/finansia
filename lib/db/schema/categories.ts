import { sql } from "drizzle-orm";
import { text, varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { z } from "zod";
import { nanoid } from "@/lib/utils";

export const categories = pgTable("categories", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text("name").notNull().unique(),
  description: text("description"),
  type: text("type").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

export const insertCategorySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  type: z.string(),
});

export type NewCategoryParams = z.infer<typeof insertCategorySchema>; 