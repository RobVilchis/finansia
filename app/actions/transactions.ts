"use server";

import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema/account";
import { categories } from "@/lib/db/schema/categories";
import { transactions } from "@/lib/db/schema/transactions";
import {
  createTransaction,
  getUnverifiedTransactions,
} from "@/lib/services/transactions";
import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { DrizzleQueryError } from "drizzle-orm/errors";
import { alias } from "drizzle-orm/pg-core";
import { revalidatePath } from "next/cache";
import { DatabaseError } from "pg";
import { TransactionFormData } from "../components/TransactionDialog";

/**
 * Server Actions for transactions
 * These functions can be called directly from client components
 */

/**
 * Helper function to safely extract string values from FormData
 */
/* function getFormDataString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return value && typeof value === "string" ? value : null;
} */

/**
 * Helper function to extract required string from FormData with validation
 */
/* function getRequiredFormDataString(
  formData: FormData,
  key: string,
  fieldName: string,
): string {
  const value = getFormDataString(formData, key);
  if (!value) {
    throw new Error(`${fieldName} es requerido`);
  }
  return value;
} */

export async function getTransactionsAction() {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "No autorizado", data: [] };
    }

    const sourceAccounts = alias(accounts, "sourceAccounts");
    const targetAccounts = alias(accounts, "targetAccounts");

    const allTransactions = await db
      .select({
        id: transactions.id,
        description: transactions.description,
        amount: transactions.amount,
        date: transactions.date,
        type: transactions.type,
        categoryName: categories.name,
        sourceAccountId: transactions.sourceAccountId,
        targetAccountId: transactions.targetAccountId,
        sourceAccountName: sourceAccounts.name,
        targetAccountName: targetAccounts.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.category, categories.id))
      .leftJoin(
        sourceAccounts,
        eq(transactions.sourceAccountId, sourceAccounts.id),
      )
      .leftJoin(
        targetAccounts,
        eq(transactions.targetAccountId, targetAccounts.id),
      )
      .where(
        and(
          eq(transactions.userId, user.id),
          eq(transactions.isUnverified, false),
        ),
      )
      .orderBy(desc(transactions.date));

    return { success: true, message: "", data: allTransactions };
  } catch (error) {
    if (error instanceof DrizzleQueryError) {
      if (error.cause instanceof DatabaseError) {
        // Connection errors
        if (error.cause.code === "08000" || error.cause.code === "08003") {
          return {
            success: false,
            message:
              "Error de conexión con la base de datos. Por favor, intenta de nuevo.",
            data: [],
          };
        }
      }
    }
    // Unknown error
    return {
      success: false,
      message:
        "Error al obtener las transacciones. Por favor, intenta de nuevo.",
      data: [],
    };
  }
}

export async function getUnverifiedTransactionsAction() {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "No autorizado", data: [] };
    }

    const unverifiedTransactions = await getUnverifiedTransactions(user.id);
    return { success: true, message: "", data: unverifiedTransactions };
  } catch (error) {
    if (error instanceof DrizzleQueryError) {
      if (error.cause instanceof DatabaseError) {
        // Connection errors
        if (error.cause.code === "08000" || error.cause.code === "08003") {
          return {
            success: false,
            message:
              "Error de conexión con la base de datos. Por favor, intenta de nuevo.",
            data: [],
          };
        }
      }
    }
    // Unknown error
    return {
      success: false,
      message:
        "Error al obtener las transacciones no verificadas. Por favor, intenta de nuevo.",
      data: [],
    };
  }
}

export async function createTransactionAction(formData: TransactionFormData) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "No autorizado" };
    }

    const created = await createTransaction({
      userId: user.id,
      description: formData.description || "",
      amount: formData.amount,
      type: formData.type as "income" | "expense" | "transfer",
      date: formData.date,
      categoryName: formData.category, // provided as name in existing API
      sourceAccountId: formData.sourceAccountId,
      targetAccountId: formData.targetAccountId,
    });

    revalidatePath("/data");
    revalidatePath("/home");

    return {
      success: true,
      message: "Transacción creada exitosamente",
      data: created,
    };
  } catch (error) {
    if (error instanceof DrizzleQueryError) {
      if (error.cause instanceof DatabaseError) {
        // Foreign key violation - account or category doesn't exist
        if (error.cause.code === "23503") {
          return {
            success: false,
            message:
              "La cuenta o categoría seleccionada no existe o no es válida",
          };
        }
        // Not null violation
        if (error.cause.code === "23502") {
          return {
            success: false,
            message: "Faltan campos requeridos para crear la transacción",
          };
        }
        // Check constraint violation (e.g., invalid amount)
        if (error.cause.code === "23514") {
          return {
            success: false,
            message:
              "Los datos de la transacción no son válidos (verifica el monto)",
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
      message: "Error al crear la transacción. Por favor, intenta de nuevo.",
    };
  }
}

export async function updateTransactionAction(
  id: string,
  updates: TransactionFormData & { isUnverified?: boolean },
) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "No autorizado" };
    }

    // Verify ownership
    const existingTransaction = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
      .limit(1);

    if (!existingTransaction.length) {
      return {
        success: false,
        message: "Transacción no encontrada o no autorizada",
      };
    }

    // Resolve category if provided
    let categoryId: string | null | undefined = updates.category;
    if (
      updates.type !== "transfer" &&
      updates.category &&
      typeof updates.category === "string"
    ) {
      const category = await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.name, updates.category),
            eq(categories.userId, user.id),
          ),
        )
        .limit(1);

      if (!category.length) {
        return { success: false, message: "Categoría inválida" };
      }
      categoryId = category[0].id;
    }
    if (updates.type === "transfer") {
      categoryId = null;
    }
    console.log("Updates Date:", updates.date);
    const correctedDate = new Date(updates.date);
    console.log("Corrected Date:", correctedDate);

    const updateData = {
      description: updates.description,
      date: correctedDate,
      amount: updates.amount?.toString(),
      type: updates.type,
      category: categoryId,
      sourceAccountId:
        updates.type === "transfer"
          ? updates.sourceAccountId
          : updates.type === "expense"
            ? updates.sourceAccountId
            : null,
      targetAccountId:
        updates.type === "transfer"
          ? updates.targetAccountId
          : updates.type === "income"
            ? updates.targetAccountId
            : null,
      isUnverified: false,
    };

    if (updates.isUnverified !== undefined) {
      updateData.isUnverified = updates.isUnverified;
    }

    const updatedTransaction = await db
      .update(transactions)
      .set(updateData)
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
      .returning();

    if (!updatedTransaction.length) {
      return { success: false, message: "Transacción no encontrada" };
    }

    revalidatePath("/data");
    revalidatePath("/home");
    revalidatePath("/data/review");

    return {
      success: true,
      message: "Transacción actualizada exitosamente",
      data: updatedTransaction[0],
    };
  } catch (error) {
    if (error instanceof DrizzleQueryError) {
      if (error.cause instanceof DatabaseError) {
        // Foreign key violation - account or category doesn't exist
        if (error.cause.code === "23503") {
          return {
            success: false,
            message:
              "La cuenta o categoría seleccionada no existe o no es válida",
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
              "Los datos de la transacción no son válidos (verifica el monto)",
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
    throw error;
    // Unknown error
    return {
      success: false,
      message:
        "Error al actualizar la transacción. Por favor, intenta de nuevo.",
    };
  }
}

export async function deleteTransactionAction(id: string) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "No autorizado" };
    }

    // Verify ownership
    const existingTransaction = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
      .limit(1);

    if (!existingTransaction.length) {
      return {
        success: false,
        message: "Transacción no encontrada o no autorizada",
      };
    }

    const deleted = await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
      .returning({ deletedId: transactions.id });

    if (!deleted.length) {
      return { success: false, message: "Transacción no encontrada" };
    }

    revalidatePath("/data");
    revalidatePath("/home");

    return {
      success: true,
      message: "Transacción eliminada exitosamente",
      data: { deletedId: deleted[0].deletedId },
    };
  } catch (error) {
    if (error instanceof DrizzleQueryError) {
      if (error.cause instanceof DatabaseError) {
        // Foreign key violation - transaction has dependent records
        if (error.cause.code === "23503") {
          return {
            success: false,
            message:
              "Esta transacción tiene registros asociados y no puede ser eliminada",
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
      message: "Error al eliminar la transacción. Por favor, intenta de nuevo.",
    };
  }
}
