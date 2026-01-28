import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { transactions } from "./schema/transactions";
import { accounts } from "./schema/account";
import { financialGoals } from "./schema/financial_goals";

export type Transaction = InferSelectModel<typeof transactions>;
export type NewTransaction = InferInsertModel<typeof transactions>;

export type Account = InferSelectModel<typeof accounts>;
export type Goal = InferSelectModel<typeof financialGoals>;
