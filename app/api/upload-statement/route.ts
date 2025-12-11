// app/api/upload/route.ts
export const runtime = "nodejs";
import { fetchUserCategories } from "@/lib/financial-data";
import {
  createStatementUpload,
  updateStatementUploadStatus,
} from "@/lib/services/statements";
import { createTransactionIfUnique } from "@/lib/services/transactions";
import { currentUser } from "@clerk/nextjs/server";
import { generateObject } from "ai";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import PDFParser from "pdf2json";
import { v4 as uuidv4 } from "uuid";
import z from "zod";

export async function POST(request: Request) {
  let fileName = "";
  let parsedText = "";
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const accountType = formData.get("accountType");
    const accountId = formData.get("accountId");
    const comments = formData.get("comments");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    fileName = uuidv4();

    // Convert the uploaded file into a temporary file
    const tempFilePath = `/tmp/${fileName}.pdf`;

    console.log("Processing file: ", tempFilePath);

    // Convert Web File → Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(tempFilePath, buffer);

    // Parse PDF
    const pdfParser = new PDFParser(null, true);

    const userCategories = await fetchUserCategories(user.id);

    const prompt = (
      content: string
    ) => `You are a financial data parser. Your job is to read uploaded bank statements and extract all transactions into the provided format.
    
    GUIDELINES:
    - Statements can be either credit card statements or checking account statements.
    - When it is a credit statement, consider only the expenses. DO NOT GENERATE CREDIT CARD PAYMENT TRANSACTIONS, IGNORE THEM.
    - When it is a checking statement, classify all transactions into income/expense.
    - The name of the account is provided by the user. Pass it into the accountName field for income, and into the targetAccountName for expenses.
    - For each transaction, generate a short description in spanish, based on the available information.
    - If there is no time value, set it to 12:00 PM by default.
    - If you can't accurately classify the transaction with the available information, leave the category as null and set needsVerification to true, for the user to classify later 
    
    ${comments ? "ADDITIONAL INSTRUCTIONS PROVIDED BY USER: " + comments : ""}

    STATEMENT TYPE: ${accountType}
    ACCOUNT NAME: ${accountId}
    STATEMENT CONTENT: 
    ${content}
    `;

    // Wrap PDF parsing in a promise to ensure it completes before proceeding
    parsedText = await new Promise<string>((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (error) => reject(error));
      pdfParser.on("pdfParser_dataReady", () => {
        resolve(pdfParser.getRawTextContent());
      });
      pdfParser.loadPDF(tempFilePath);
    });

    console.log("File processed successfully");

    const statement = await createStatementUpload({
      userId: user.id,
      originalFileName: fileName,
      extractedText: parsedText,
      status: "processing",
    });

    try {
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
          accountName: z
            .string()
            .describe(
              "User-provided acccount for expenses. Leave empty if it is income."
            ),
          targetAccountName: z
            .string()
            .describe(
              "User-provided account for income. Leave empty if it is an expense."
            ),
          needsVerification: z
            .boolean()
            .describe("Set to true if user verification is needed"),
        }),
        prompt: prompt(parsedText),
      });

      const transactionsToVerify = response.object.filter(
        (t) => t.needsVerification
      );
      const completeTransactions = response.object.filter(
        (t) => !t.needsVerification
      );
      
      console.log(`Generated ${completeTransactions.length} transactions`);
      console.log(`Generated ${transactionsToVerify.length} transactions that need verification`);
      
      // Await database operations to ensure they complete
      await Promise.all(response.object.map(transaction => 
        createTransactionIfUnique({
          userId: user.id,
          ...transaction,
          accountId: transaction.accountName,
        })
      ));

      await updateStatementUploadStatus(statement.id, "ready");
    } catch (error) {
      await updateStatementUploadStatus(statement.id, "error");
      console.error("Failed to parse statement", error);
      throw error;
    }

    const response = new NextResponse(parsedText);
    response.headers.set("FileName", fileName);
    return response;
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
