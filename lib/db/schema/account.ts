import { nanoid } from "@/lib/utils";
import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./user";

export const accounts = pgTable("accounts", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: varchar("user_id", { length: 191 }).references(() => users.id),
  name: text("name").notNull().unique(),
  type: text("type"),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});
