"use server";

import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema/account";
import { financialGoals } from "@/lib/db/schema/financial_goals";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { DrizzleQueryError } from "drizzle-orm/errors";
import { revalidatePath } from "next/cache";
import { DatabaseError } from "pg";
import { GoalFormData } from "../components/NewGoalDialog";

/**
 * Server Actions for goals
 * These functions can be called directly from client components
 */

export async function createGoalAction(data: GoalFormData) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "No autorizado" };
    }

    // Check if account with this name already exists
    const existingAccount = await db
      .select()
      .from(accounts)
      .where(eq(accounts.name, data.name));

    if (existingAccount.length > 0) {
      return {
        success: false,
        message: "Ya existe una cuenta con este nombre",
      };
    }

    // Create the account first
    const account = await db
      .insert(accounts)
      .values({
        name: data.name,
        userId: user.id,
      })
      .returning();

    // Create the goal
    const newGoal = await db
      .insert(financialGoals)
      .values({
        name: data.name,
        targetAmount: data.targetAmount,
        targetDate: data.targetDate ? data.targetDate : null,
        accountId: account[0].id,
        userId: user.id,
      })
      .returning();

    revalidatePath("/data");
    revalidatePath("/home");

    return {
      success: true,
      message: "Meta creada exitosamente",
      data: newGoal[0],
    };
  } catch (error) {
    if (error instanceof DrizzleQueryError) {
      if (error.cause instanceof DatabaseError) {
        // Unique constraint violation
        if (error.cause.code === "23505") {
          return {
            success: false,
            message: "Ya existe una meta con este nombre",
          };
        }
        // Not null violation
        if (error.cause.code === "23502") {
          return {
            success: false,
            message: "Faltan campos requeridos para crear la meta",
          };
        }
        // Foreign key violation
        if (error.cause.code === "23503") {
          return {
            success: false,
            message: "La cuenta asociada no existe o no es válida",
          };
        }
        // Check constraint violation (e.g., invalid amount or date)
        if (error.cause.code === "23514") {
          return {
            success: false,
            message:
              "Los datos de la meta no son válidos (verifica el monto o la fecha)",
          };
        }
        // Connection errors
        if (error.cause.code === "08000" || error.cause.code === "08003") {
          return {
            success: false,
            message:
              "Error de conexión con la base de datos. Por favor, intenta de nuevo.",
          };
        }
      }
    }
    // Unknown error
    return {
      success: false,
      message: "Error al crear la meta. Por favor, intenta de nuevo.",
    };
  }
}

export async function updateGoalAction(id: string, data: GoalFormData) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "No autorizado" };
    }

    // First check if the goal belongs to the user
    const existingGoal = await db
      .select()
      .from(financialGoals)
      .where(and(eq(financialGoals.id, id), eq(financialGoals.userId, user.id)))
      .limit(1);

    if (!existingGoal.length) {
      return { success: false, message: "Meta no encontrada o no autorizada" };
    }

    // Update the goal, preserving the accountId
    const updatedGoal = await db
      .update(financialGoals)
      .set({
        name: data.name,
        targetAmount: data.targetAmount,
        targetDate: data.targetDate ? data.targetDate : null,
      })
      .where(and(eq(financialGoals.id, id), eq(financialGoals.userId, user.id)))
      .returning();

    if (!updatedGoal.length) {
      return { success: false, message: "Meta no encontrada" };
    }

    revalidatePath("/data");
    revalidatePath("/home");

    return {
      success: true,
      message: "Meta actualizada exitosamente",
      data: updatedGoal[0],
    };
  } catch (error) {
    if (error instanceof DrizzleQueryError) {
      if (error.cause instanceof DatabaseError) {
        // Unique constraint violation
        if (error.cause.code === "23505") {
          return {
            success: false,
            message: "Ya existe una meta con este nombre",
          };
        }
        // Not null violation
        if (error.cause.code === "23502") {
          return { success: false, message: "Faltan campos requeridos" };
        }
        // Check constraint violation
        if (error.cause.code === "23514") {
          return {
            success: false,
            message:
              "Los datos de la meta no son válidos (verifica el monto o la fecha)",
          };
        }
        // Connection errors
        if (error.cause.code === "08000" || error.cause.code === "08003") {
          return {
            success: false,
            message:
              "Error de conexión con la base de datos. Por favor, intenta de nuevo.",
          };
        }
      }
    }
    // Unknown error
    return {
      success: false,
      message: "Error al actualizar la meta. Por favor, intenta de nuevo.",
    };
  }
}

export async function deleteGoalAction(id: string) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "No autorizado" };
    }

    // First check if the goal belongs to the user
    const existingGoal = await db
      .select()
      .from(financialGoals)
      .where(and(eq(financialGoals.id, id), eq(financialGoals.userId, user.id)))
      .limit(1);

    if (!existingGoal.length) {
      return { success: false, message: "Meta no encontrada o no autorizada" };
    }

    const deleted = await db
      .delete(financialGoals)
      .where(and(eq(financialGoals.id, id), eq(financialGoals.userId, user.id)))
      .returning({ deletedId: financialGoals.id });

    if (!deleted.length) {
      return { success: false, message: "Meta no encontrada" };
    }

    revalidatePath("/data");
    revalidatePath("/home");

    return {
      success: true,
      message: "Meta eliminada exitosamente",
      data: { deletedId: deleted[0].deletedId },
    };
  } catch (error) {
    if (error instanceof DrizzleQueryError) {
      if (error.cause instanceof DatabaseError) {
        // Foreign key violation - goal has dependent records
        if (error.cause.code === "23503") {
          return {
            success: false,
            message:
              "Esta meta tiene registros asociados y no puede ser eliminada",
          };
        }
        // Connection errors
        if (error.cause.code === "08000" || error.cause.code === "08003") {
          return {
            success: false,
            message:
              "Error de conexión con la base de datos. Por favor, intenta de nuevo.",
          };
        }
      }
    }
    // Unknown error
    return {
      success: false,
      message: "Error al eliminar la meta. Por favor, intenta de nuevo.",
    };
  }
}
