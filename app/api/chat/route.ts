import {
  fetchAllFinancialData,
  fetchUserAccounts,
  fetchUserCategories,
  getFirst50,
} from "@/lib/financial-data";
import {
  createTransaction,
  deleteTransactions,
  getTransactions,
} from "@/lib/services/transactions";
import { currentUser } from "@clerk/nextjs/server";
import { convertToModelMessages, streamText, tool, UIMessage } from "ai";
import { revalidatePath } from "next/cache";
import z from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 300;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const user = await currentUser();

  if (!user) return new Response("Unauthorized", { status: 401 });

  const { transactions, goals, accounts, categorySum } =
    await fetchAllFinancialData(user.id);

  const userCategories = await fetchUserCategories(user.id);
  const userAccounts = await fetchUserAccounts(user.id);

  // Build lookups for cross-field validation
  const categoryByName = new Map(
    userCategories.map((category) => [category.name, category])
  );

  const systemContext = `
  You are an expert financial advisor with deep knowledge of personal finance, budgeting, investment strategies, and financial planning. Your role is to provide personalized, actionable financial advice based on the user's financial data.

  RESPONSE GUIDELINES:
  - Be concise, professional, and empathetic
  - Provide specific, actionable recommendations when possible
  - Use the financial data provided to give personalized insights
  - Ask clarifying questions when you need more information
  - Focus on practical advice rather than generic statements
  - Consider the user's goals and current financial situation
  - Suggest specific next steps when appropriate

  CURRENT DATE: ${new Date().toLocaleDateString()}

  USER'S FINANCIAL DATA:

  LOCATION:
  Mexico

  CURRENCY:
  Mexican Pesos

  RECENT TRANSACTIONS (last 20):
  ${JSON.stringify(getFirst50(transactions), null, 2)}

  SPENDING BY CATEGORY (last 30 days):
  ${JSON.stringify(categorySum, null, 2)}

  FINANCIAL GOALS:
  ${JSON.stringify(goals, null, 2)}

  ACCOUNTS & BALANCES:
  ${JSON.stringify(accounts, null, 2)}

  ANALYSIS CONTEXT:
  - Review spending patterns and identify areas for improvement
  - Assess progress toward financial goals
  - Evaluate account balances and cash flow
  - Suggest budgeting strategies based on spending data
  - Recommend adjustments to goal timelines or amounts if needed
  - Identify potential savings opportunities

  When analyzing the data, consider:
  - Spending trends and unusual patterns
  - Goal progress relative to target dates
  - Account balance distribution and liquidity
  - Category-wise spending optimization opportunities
  - Income vs expense ratios
  - Emergency fund adequacy
  `;

  const result = streamText({
    model: "openai/gpt-5",
    tools: {
      createTransaction: tool({
        description: "Create a new transaction for the user",
        inputSchema: z
          .object({
            name: z.string().describe("Name of the transaction"),
            date: z.string().date().describe("Date of the transaction"),
            time: z.string().time().describe("Time of the transaction"),
            amount: z.number().describe("Amount of the transaction"),
            category: z
              .enum(
                (userCategories.length > 0
                  ? userCategories.map((category) => category.name)
                  : [""]) as [string, ...string[]]
              )
              .describe(
                "Category of the transaction. Must match the selected type (expense categories for expense, income categories for income)."
              ),
            type: z
              .enum(["expense", "income", "transfer"])
              .describe("Type of the transaction"),
            accountName: z
              .enum(
                (userAccounts.length > 0
                  ? userAccounts.map((account) => account.name)
                  : [""]) as [string, ...string[]]
              )
              .describe(
                "Source account for the transaction, if the type is expense or transfer"
              ),
            targetAccountName: z
              .enum(
                (userAccounts.length > 0
                  ? userAccounts.map((account) => account.name)
                  : [""]) as [string, ...string[]]
              )
              .describe(
                "Target Account ID of the transaction, if the type is transfer or income"
              ),
          })
          .superRefine((val, ctx) => {
            // Skip category/type validation for transfers if your model doesn't use categories for them
            if (val.type === "transfer") return;

            const category = categoryByName.get(val.category);
            if (!category) {
              ctx.addIssue({
                code: "custom",
                message: `Unknown category: ${val.category}`,
                path: ["category"],
              });
              return;
            }

            if (category.type !== val.type) {
              ctx.addIssue({
                code: "custom",
                message: `Category "${val.category}" is of type "${category.type}" but transaction type is "${val.type}"`,
                path: ["category"],
              });
            }
          }),
        execute: async ({
          name,
          date,
          time,
          amount,
          category,
          type,
          accountName,
          targetAccountName,
        }) => {
          const created = await createTransaction({
            userId: user!.id,
            description: name,
            amount,
            type,
            date,
            time,
            categoryName: category,
            accountName,
            targetAccountName,
          });

          return {
            id: created.id,
            description: created.description,
            amount: created.amount,
            date: created.date,
            type: created.type,
            sourceAccountId: created.sourceAccountId,
            targetAccountId: created.targetAccountId,
            category: created.category,
          };
        },
      }),
      retrieveTransactions: tool({
        description: "Retrieve transactions by any criteria",
        inputSchema: z
          .object({
            description: z
              .string()
              .describe("Description of the transaction")
              .optional(),
            amount: z.number().describe("Amount of the transaction").optional(),
            category: z
              .enum(
                (userCategories.length > 0
                  ? userCategories.map((category) => category.name)
                  : [""]) as [string, ...string[]]
              )
              .describe(
                "Category of the transaction. Must match the selected type (expense categories for expense, income categories for income)."
              )
              .optional(),
            type: z
              .enum(["expense", "income", "transfer"])
              .describe("Type of the transaction")
              .optional(),
            accountName: z
              .enum(
                (userAccounts.length > 0
                  ? userAccounts.map((account) => account.name)
                  : [""]) as [string, ...string[]]
              )
              .describe(
                "Source account for the transaction, if the type is expense or transfer"
              )
              .optional(),
            targetAccountName: z
              .enum(
                (userAccounts.length > 0
                  ? userAccounts.map((account) => account.name)
                  : [""]) as [string, ...string[]]
              )
              .describe(
                "Target Account ID of the transaction, if the type is transfer or income"
              )
              .optional(),
            startDatetime: z
              .string()
              .datetime()
              .describe("Start datetime for date range filtering")
              .optional(),
            endDatetime: z
              .string()
              .datetime()
              .describe("End datetime for date range filtering")
              .optional(),
          })
          .superRefine((data, ctx) => {
            // Check that at least one argument is provided
            if (
              data.description === undefined &&
              data.amount === undefined &&
              data.category === undefined &&
              data.type === undefined &&
              data.accountName === undefined &&
              data.targetAccountName === undefined &&
              data.startDatetime === undefined &&
              data.endDatetime === undefined
            ) {
              ctx.addIssue({
                code: "custom",
                message: "At least one argument must be provided",
                path: [],
              });
            }

            // If startDate is provided, endDate must also be provided
            if (
              data.startDatetime !== undefined &&
              data.endDatetime === undefined
            ) {
              ctx.addIssue({
                code: "custom",
                message:
                  "If startDatetime is provided, endDatetime must also be provided",
                path: ["endDatetime"],
              });
            }
          }),
        execute: async (criteria) => {
          console.log("criteria", criteria);
          const transactions = await getTransactions({
            userId: user!.id,
            description: criteria.description,
            categoryName: criteria.category,
            type: criteria.type,
            accountName: criteria.accountName,
            targetAccountName: criteria.targetAccountName,
            startDatetime: criteria.startDatetime
              ? new Date(criteria.startDatetime)
              : undefined,
            endDatetime: criteria.endDatetime
              ? new Date(criteria.endDatetime)
              : undefined,
          });
          return transactions;
        },
      }),
      deleteTransactions: tool({
        description:
          "Delete transactions specified by the user. Ask user for confirmation first.",
        inputSchema: z
          .object({
            description: z
              .string()
              .describe("Description of the transaction")
              .optional(),
            amount: z.number().describe("Amount of the transaction").optional(),
            category: z
              .enum(
                (userCategories.length > 0
                  ? userCategories.map((category) => category.name)
                  : [""]) as [string, ...string[]]
              )
              .describe(
                "Category of the transaction. Must match the selected type (expense categories for expense, income categories for income)."
              )
              .optional(),
            type: z
              .enum(["expense", "income", "transfer"])
              .describe("Type of the transaction")
              .optional(),
            accountName: z
              .enum(
                (userAccounts.length > 0
                  ? userAccounts.map((account) => account.name)
                  : [""]) as [string, ...string[]]
              )
              .describe(
                "Source account for the transaction, if the type is expense or transfer"
              )
              .optional(),
            targetAccountName: z
              .enum(
                (userAccounts.length > 0
                  ? userAccounts.map((account) => account.name)
                  : [""]) as [string, ...string[]]
              )
              .describe(
                "Target Account ID of the transaction, if the type is transfer or income"
              )
              .optional(),
            startDatetime: z
              .string()
              .datetime()
              .describe("Start datetime for date range filtering")
              .optional(),
            endDatetime: z
              .string()
              .datetime()
              .describe("End datetime for date range filtering")
              .optional(),
          })
          .superRefine((data, ctx) => {
            // Check that at least one argument is provided
            if (
              data.description === undefined &&
              data.amount === undefined &&
              data.category === undefined &&
              data.type === undefined &&
              data.accountName === undefined &&
              data.targetAccountName === undefined &&
              data.startDatetime === undefined &&
              data.endDatetime === undefined
            ) {
              ctx.addIssue({
                code: "custom",
                message: "At least one argument must be provided",
                path: [],
              });
            }

            // If startDate is provided, endDate must also be provided
            if (
              data.startDatetime !== undefined &&
              data.endDatetime === undefined
            ) {
              ctx.addIssue({
                code: "custom",
                message:
                  "If startDatetime is provided, endDatetime must also be provided",
                path: ["endDatetime"],
              });
            }
          }),
        execute: async (criteria) => {
          deleteTransactions({
            userId: user!.id,
            description: criteria.description,
            categoryName: criteria.category,
            type: criteria.type,
            accountName: criteria.accountName,
            targetAccountName: criteria.targetAccountName,
            startDatetime: criteria.startDatetime
              ? new Date(criteria.startDatetime)
              : undefined,
            endDatetime: criteria.endDatetime
              ? new Date(criteria.endDatetime)
              : undefined,
          });
        },
      }),
    },
    system: systemContext,
    messages: convertToModelMessages(messages),
  });

  revalidatePath("/data");

  return result.toUIMessageStreamResponse();
}
