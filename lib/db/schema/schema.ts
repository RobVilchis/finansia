import {
  foreignKey,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";

export const resources = pgTable("resources", {
  id: varchar({ length: 191 }).primaryKey().notNull(),
  content: text().notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const expenses = pgTable(
  "expenses",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    concept: text().notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    categoryId: varchar("category_id", { length: 191 }).notNull(),
    date: timestamp({ mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: "expenses_category_id_categories_id_fk",
    }),
  ]
);
