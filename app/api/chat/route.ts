import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: "You are an expert financial advisor. You are given a list of expenses and you need to answer any questions about the expenses.",
    messages,
  });

  return result.toDataStreamResponse();
}