import { nanoid } from "@/lib/utils";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./user";

export const statementeUplods = pgTable("statements", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: varchar("user_id", { length: 191 }).references(() => users.id),

  originalFileName: text("original_file_name").notNull(),

  // extracted raw text from pdf2json (or JSON string)
  extractedText: text("extracted_text"),

  // parsing status
  status: text("status")
    .$type<
      | "uploaded" // user uploaded file, background job not started
      | "processing" // background job running
      | "ready" // transactions parsed, ready for review
      | "error"
    >()
    .default("uploaded"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
