import { nanoid } from "@/lib/utils";
import {
  boolean,
  date,
  decimal,
  index,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { accounts } from "./account";
import { categories } from "./categories";
import { users } from "./user";

export const recurringTransactions = pgTable("recurring_transactions", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: varchar("user_id", { length: 191 }).references(() => users.id),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: text("type").notNull(), // "income", "expense", "transfer"
  category: varchar("category_id").references(() => categories.id),
  sourceAccountId: varchar("source_account_id").references(() => accounts.id),
  targetAccountId: varchar("target_account_id").references(() => accounts.id),
  frequency: text("frequency").notNull(), // "daily", "weekly", "biweekly", "monthly", "quarterly", "semi-annually", "yearly"
  startDate: date("start_date").notNull(),
  endDate: date("end_date"), // null = indefinite
  nextRunDate: date("next_run_date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ([
  index("idx_recurring_user_id").on(table.userId),
  index("idx_recurring_next_run").on(table.nextRunDate),
  index("idx_recurring_active").on(table.isActive),
]));

export type RecurringTransaction = typeof recurringTransactions.$inferSelect;
export type NewRecurringTransaction = typeof recurringTransactions.$inferInsert;

export type Frequency = "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "semi-annually" | "yearly";

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: "Diario",
  weekly: "Semanal",
  biweekly: "Quincenal",
  monthly: "Mensual",
  quarterly: "Trimestral",
  "semi-annually": "Semestral",
  yearly: "Anual",
};
