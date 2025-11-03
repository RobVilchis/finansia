import { db } from "@/lib/db";
import { financialTips } from "@/lib/db/schema/financial_tips";
import {
  errorHandler,
  fetchAllFinancialData,
  getFirst50,
} from "@/lib/financial-data";
import { currentUser } from "@clerk/nextjs/server";
import { generateObject } from "ai";
import { z } from "zod";

// Allow responses up to 30 seconds
export const maxDuration = 30;

// Define the schema for tips
const tipSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.enum(["income", "expenses", "goals"]),
});

const tipsResponseSchema = z.object({
  tips: z.array(tipSchema).length(3),
});

// Function to save tips to database
async function saveTipsToDatabase(
  userId: string,
  tips: Array<{ title: string; description: string; category: string }>
) {
  const currentMonth = new Date().toISOString().slice(0, 7); // "2025-01" format

  const tipInserts = tips.map((tip) => ({
    userId,
    month: currentMonth,
    category: tip.category,
    title: tip.title,
    fullText: tip.description,
    source: "openai",
  }));

  try {
    const savedTips = await db
      .insert(financialTips)
      .values(tipInserts)
      .returning();

    console.log(
      `Saved ${savedTips.length} tips to database for user ${userId}`
    );
    return savedTips;
  } catch (error) {
    console.error("Error saving tips to database:", error);
    throw error;
  }
}

export async function GET() {
  const user = await currentUser();

  if (!user) return new Response("Unauthorized", { status: 401 });

  const { transactions, goals, accounts, categorySum } =
    await fetchAllFinancialData(user.id);

  const systemContext = `
  You are an expert financial advisor specializing in providing personalized financial tips. Your task is to generate exactly 3 actionable financial tips based on the user's financial data.

  RESPONSE REQUIREMENTS:
  - Generate EXACTLY 3 tips, no more, no less
  - Each tip should be specific and actionable
  - Each tip should have a title, description and a category (income, expenses, goals)
  - Base tips on the user's actual financial situation
  - Make tips relevant to their spending patterns, goals, and account balances
  - Keep each tip concise but informative
  - Focus on practical, implementable advice

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

  ANALYSIS FOCUS:
  - Identify the biggest spending categories and suggest optimization
  - Assess goal progress and suggest adjustments if needed
  - Evaluate account balance distribution and suggest improvements
  - Look for savings opportunities based on spending patterns
  - Consider emergency fund adequacy
  - Suggest budgeting improvements based on actual data

  Remember: Provide exactly 3 tips that are personalized to this user's financial situation.
  `;

  try {
    const result = await generateObject({
      model: "openai/gpt-5",
      system: systemContext,
      messages: [
        {
          role: "user",
          content:
            "Generate 3 personalized financial tips for me based on my financial data.",
        },
      ],
      schema: tipsResponseSchema,
    });

    // Save tips to database
    if (result.object.tips.length > 0) {
      await saveTipsToDatabase(user.id, result.object.tips);
    }

    // Return the generated tips as JSON
    return new Response(JSON.stringify({ tips: result.object.tips }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating tips:", error);
    return new Response(JSON.stringify({ error: errorHandler(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
