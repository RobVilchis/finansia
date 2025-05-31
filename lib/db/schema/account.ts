import { nanoid } from "@/lib/utils";
import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const accounts = pgTable("accounts", {
    id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
    name: text("name").notNull().unique(),
    type: text("type"),
    createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
    updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
})