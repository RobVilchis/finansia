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
export const maxDuration = 300;

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
  Eres un asesor financiero experto especializado en brindar consejos financieros personalizados. Tu tarea es generar exactamente 3 consejos financieros prácticos basados en los datos financieros del usuario.

  REQUISITOS DE LA RESPUESTA:
  - Genera EXACTAMENTE 3 consejos, ni más ni menos
  - Cada consejo debe ser específico y accionable
  - Cada consejo debe tener un título (title), descripción (description) y una categoría (category: income, expenses o goals)
  - Basa los consejos en la situación financiera real del usuario
  - Haz que los consejos sean relevantes para sus patrones de gasto, metas y saldos de cuentas
  - Mantén cada consejo conciso pero informativo
  - Enfócate en consejos prácticos y fáciles de implementar

  FECHA ACTUAL: ${new Date().toLocaleDateString()}

  DATOS FINANCIEROS DEL USUARIO:

  UBICACIÓN:
  México

  MONEDA:
  Pesos Mexicanos

  TRANSACCIONES RECIENTES (últimas 20):
  ${JSON.stringify(getFirst50(transactions), null, 2)}

  GASTOS POR CATEGORÍA (últimos 30 días):
  ${JSON.stringify(categorySum, null, 2)}

  METAS FINANCIERAS:
  ${JSON.stringify(goals, null, 2)}

  CUENTAS Y SALDOS:
  ${JSON.stringify(accounts, null, 2)}

  ENFOQUE DEL ANÁLISIS:
  - Identificar las categorías de mayor gasto y sugerir optimización
  - Evaluar el progreso de las metas y sugerir ajustes si es necesario
  - Evaluar la distribución del saldo de las cuentas y sugerir mejoras
  - Buscar oportunidades de ahorro basadas en patrones de gasto
  - Considerar la suficiencia del fondo de emergencia
  - Sugerir mejoras en el presupuesto basadas en datos reales

  Recuerda: Proporciona exactamente 3 consejos que estén personalizados para la situación financiera de este usuario.
  `;

  try {
    const result = await generateObject({
      model: "openai/gpt-5",
      system: systemContext,
      messages: [
        {
          role: "user",
          content:
            "Genera 3 consejos financieros personalizados para mí basándote en mis datos financieros.",
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
