import { db } from "@/lib/db";
import { financialTips } from "@/lib/db/schema/financial_tips";
import { users } from "@/lib/db/schema/user";
import {
  fetchAllFinancialData,
  getFirst50,
} from "@/lib/financial-data";
import { materializeRecurringTransactions } from "@/lib/services/recurringTransactions";
import { generateObject } from "ai";
import { z } from "zod";

// Allow responses up to 30 seconds
export const maxDuration = 300;

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Define the schema for tips
const tipSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.enum(["income", "expenses", "goals"]),
});

const userTipsSchema = z.object({
  userId: z.string(),
  tips: z.array(tipSchema).length(3),
});

const allTipsResponseSchema = z.object({
  users: z.array(userTipsSchema),
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

export async function GET(request: Request) {
  // Verify cron secret (Vercel Cron Jobs send this header automatically)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Materialize any due recurring transactions
  try {
    const result = await materializeRecurringTransactions();
    console.log(
      `Recurring transactions: created ${result.createdCount} from ${result.processedRecurrings} rules`
    );
  } catch (error) {
    console.error("Error materializing recurring transactions:", error);
  }

  // Fetch all users and their financial data in parallel
  const allUsers = await db
    .select({ id: users.id })
    .from(users);

  const usersData = await Promise.all(
    allUsers.map(async (user) => {
      const { transactions, goals, accounts, categorySum } =
        await fetchAllFinancialData(user.id);
      return {
        userId: user.id,
        transactions: getFirst50(transactions),
        goals,
        accounts,
        categorySum,
      };
    })
  );

  const systemContext = `
    Eres un asesor financiero experto especializado en brindar consejos financieros personalizados. Tu tarea es generar exactamente 3 consejos financieros prácticos por usuario basados en sus datos financieros.

    REQUISITOS DE LA RESPUESTA:
    - Genera EXACTAMENTE 3 consejos por usuario, ni más ni menos
    - Cada consejo debe ser específico y accionable
    - Cada consejo debe tener un título (title), descripción (description) y una categoría (category: income, expenses o goals)
    - Basa los consejos en la situación financiera real de cada usuario
    - Haz que los consejos sean relevantes para sus patrones de gasto, metas y saldos de cuentas
    - Mantén cada consejo conciso pero informativo
    - Enfócate en consejos prácticos y fáciles de implementar
    - Devuelve los consejos agrupados por userId

    FECHA ACTUAL: ${new Date().toLocaleDateString()}

    UBICACIÓN: México
    MONEDA: Pesos Mexicanos

    ENFOQUE DEL ANÁLISIS:
    - Identificar las categorías de mayor gasto y sugerir optimización
    - Evaluar el progreso de las metas y sugerir ajustes si es necesario
    - Evaluar la distribución del saldo de las cuentas y sugerir mejoras
    - Buscar oportunidades de ahorro basadas en patrones de gasto
    - Considerar la suficiencia del fondo de emergencia
    - Sugerir mejoras en el presupuesto basadas en datos reales
  `;

  try {
    const result = await generateObject({
      model: "openai/gpt-5",
      system: systemContext,
      messages: [
        {
          role: "user",
          content: `Genera 3 consejos financieros personalizados para cada uno de los siguientes usuarios basándote en sus datos financieros:\n\n${JSON.stringify(usersData, null, 2)}`,
        },
      ],
      schema: allTipsResponseSchema,
    });

    // Save tips for each user
    const allTips = [];
    for (const userResult of result.object.users) {
      if (userResult.tips.length > 0) {
        await saveTipsToDatabase(userResult.userId, userResult.tips);
        allTips.push(...userResult.tips);
      }
    }

    return new Response(JSON.stringify({ tips: allTips }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error generating tips:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  }
}
