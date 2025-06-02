import { nanoid } from "@/lib/utils";
import { date, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  email: text("email").notNull(),
  createdAt: date("Created_at").defaultNow(),
});
