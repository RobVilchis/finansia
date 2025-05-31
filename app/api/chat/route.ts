import { fetchTransactions } from "@/lib/fetchTransactions";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

function getFirst50<T>(list: T[]): T[] {
  return list.length > 20 ? list.slice(0, 20) : list;
}
export async function POST(req: Request) {
  const { messages } = await req.json();

  const transactions = await fetchTransactions();
  const lastTransactions = getFirst50(transactions);

  const systemContext = `
  You are an expert financial advisor. You are given a list of transactions (income/expenses) and you need to answer any questions or advice the user may ask.

  Here are the last transactions made by the user:
  ${JSON.stringify(lastTransactions)}
  `;

  const result = streamText({
    model: openai("gpt-4o"),
    system: systemContext,
    messages,
  });

  return result.toDataStreamResponse();
}
