export const runtime = "nodejs";
import { fetchUserCategories } from "@/lib/financial-data";
import {
  createStatementUpload,
  updateStatementText,
  updateStatementUploadStatus,
} from "@/lib/services/statements";
import { createTransactionIfUnique } from "@/lib/services/transactions";
import { currentUser } from "@clerk/nextjs/server";
import { generateObject } from "ai";
import { promises as fs } from "fs";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import PDFParser from "pdf2json";
import { v4 as uuidv4 } from "uuid";
import z from "zod";

const createPrompt = (
  content: string,
  accountType: string | null,
  accountId: string | null,
  comments: string | null
) => `You are a financial data parser. Your job is to read uploaded bank statements and extract all transactions into the provided format.

GUIDELINES:
- Statements can be either credit card statements or checking account statements.
- When it is a credit statement, consider only the expenses. DO NOT GENERATE CREDIT CARD PAYMENT TRANSACTIONS, IGNORE THEM.
- When it is a checking statement, classify all transactions into income/expense.
- The name of the account is provided by the user. Pass it into the accountName field for expenses, and into the targetAccountName for income.
- For each transaction, generate a short description in spanish, based on the available information.
- If there is no time value, set it to 12:00 PM by default.
- If you can't accurately classify the transaction with the available information, leave the category as null and set needsVerification to true, for the user to classify later 

${comments ? "ADDITIONAL INSTRUCTIONS PROVIDED BY USER: " + comments : ""}

STATEMENT TYPE: ${accountType}
ACCOUNT NAME: ${accountId}
STATEMENT CONTENT: 
${content}
`;

async function processStatement(
  statementId: string,
  tempFilePath: string,
  userId: string,
  userCategories: {
    id: string;
    name: string;
    type: string;
  }[],
  accountType: string,
  accountId: string,
  comments: string
) {
  try {
    console.log(`Starting background processing for statement ${statementId}`);

    // Parse PDF
    const pdfParser = new PDFParser(null, true);
    const parsedText = await new Promise<string>((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (error) => reject(error));
      pdfParser.on("pdfParser_dataReady", () => {
        resolve(pdfParser.getRawTextContent());
      });
      pdfParser.loadPDF(tempFilePath);
    });

    console.log("File processed successfully, updating text...");

    await updateStatementText(statementId, parsedText);
    const prompt = createPrompt(parsedText, accountType, accountId, comments);

    const response = await generateObject({
      model: "anthropic/claude-sonnet-4.5",
      output: "array",
      schema: z.object({
        description: z.string().describe("Description of the transaction"),
        date: z.string().date().describe("Date of the transaction"),
        time: z.string().time().describe("Time of the transaction"),
        amount: z.number().describe("Amount of the transaction"),
        categoryName: z
          .enum(
            (userCategories.length > 0
              ? userCategories.map((category) => category.name)
              : [""]) as [string, ...string[]]
          )
          .nullable()
          .describe(
            "Category of the transaction. Must match the selected type (expense categories for expense, income categories for income). Leave as null if the transaction cannot be accurately classified."
          ),
        type: z
          .enum(["expense", "income", "transfer"])
          .describe("Type of the transaction"),
        sourceAccountId: z
          .string()
          .describe(
            "User-provided acccount for expenses. Leave empty if it is income."
          ),
        targetAccountId: z
          .string()
          .describe(
            "User-provided account for income. Leave empty if it is an expense."
          ),
        needsVerification: z
          .boolean()
          .describe("Set to true if user verification is needed"),
      }),
      prompt: prompt,
    });

    const transactionsToVerify = response.object.filter(
      (t) => t.needsVerification
    );
    const completeTransactions = response.object.filter(
      (t) => !t.needsVerification
    );

    console.log(`Generated ${completeTransactions.length} transactions`);
    console.log(
      `Generated ${transactionsToVerify.length} transactions to verify`
    );

    await Promise.all(
      response.object.map((transaction) =>
        createTransactionIfUnique({
          userId: userId,
          ...transaction,
        })
      )
    );

    await updateStatementUploadStatus(statementId, "ready");

    revalidatePath("/data");
    revalidatePath("/home");
    console.log(`Background processing complete for statement ${statementId}`);
  } catch (error) {
    console.error(
      `Background processing failed for statement ${statementId}`,
      error
    );
    await updateStatementUploadStatus(statementId, "error");
  }
}

export async function POST(request: Request) {
  let fileName = "";
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const accountType = formData.get("accountType") as string;
    const accountId = formData.get("accountId") as string;
    const comments = formData.get("comments") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    fileName = uuidv4();

    const tempFilePath = `/tmp/${fileName}.pdf`;
    console.log("Saving file: ", tempFilePath);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(tempFilePath, buffer);

    const userCategories = await fetchUserCategories(user.id);

    // Create DB record immediately
    const statement = await createStatementUpload({
      userId: user.id,
      originalFileName: fileName,
      extractedText: "", // Initial empty text
      status: "processing",
    });

    // Start background processing WITHOUT awaiting
    processStatement(
      statement.id,
      tempFilePath,
      user.id,
      userCategories,
      accountType,
      accountId,
      comments
    ).catch((err) => console.error("Detached process error:", err));

    return NextResponse.json(
      {
        status: "processing",
        statementId: statement.id,
        message: "File processing started in background",
      },
      { status: 202 }
    );
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
