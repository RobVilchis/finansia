"use server";

import {
  createRecurringTransaction,
  deleteRecurringTransaction,
  getRecurringTransactions,
  toggleRecurringTransaction,
  updateRecurringTransaction,
  type CreateRecurringTransactionInput,
  type UpdateRecurringTransactionInput,
} from "@/lib/services/recurringTransactions";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getRecurringTransactionsAction() {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "No autorizado", data: [] };
    }

    const data = await getRecurringTransactions(user.id);
    return { success: true, message: "", data };
  } catch {
    return {
      success: false,
      message:
        "Error al obtener las transacciones recurrentes. Por favor, intenta de nuevo.",
      data: [],
    };
  }
}

export async function createRecurringTransactionAction(
  input: Omit<CreateRecurringTransactionInput, "userId">
) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "No autorizado" };
    }

    const created = await createRecurringTransaction({
      ...input,
      userId: user.id,
    });

    revalidatePath("/recurring");
    revalidatePath("/home");

    return {
      success: true,
      message: "Transacción recurrente creada exitosamente",
      data: created,
    };
  } catch {
    return {
      success: false,
      message:
        "Error al crear la transacción recurrente. Por favor, intenta de nuevo.",
    };
  }
}

export async function updateRecurringTransactionAction(
  id: string,
  input: UpdateRecurringTransactionInput
) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "No autorizado" };
    }

    const updated = await updateRecurringTransaction(user.id, id, input);

    if (!updated) {
      return {
        success: false,
        message: "Transacción recurrente no encontrada",
      };
    }

    revalidatePath("/recurring");
    revalidatePath("/home");

    return {
      success: true,
      message: "Transacción recurrente actualizada exitosamente",
      data: updated,
    };
  } catch {
    return {
      success: false,
      message:
        "Error al actualizar la transacción recurrente. Por favor, intenta de nuevo.",
    };
  }
}

export async function deleteRecurringTransactionAction(id: string) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "No autorizado" };
    }

    const deleted = await deleteRecurringTransaction(user.id, id);

    if (!deleted) {
      return {
        success: false,
        message: "Transacción recurrente no encontrada",
      };
    }

    revalidatePath("/recurring");
    revalidatePath("/home");

    return {
      success: true,
      message: "Transacción recurrente eliminada exitosamente",
    };
  } catch {
    return {
      success: false,
      message:
        "Error al eliminar la transacción recurrente. Por favor, intenta de nuevo.",
    };
  }
}

export async function toggleRecurringTransactionAction(
  id: string,
  isActive: boolean
) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "No autorizado" };
    }

    const updated = await toggleRecurringTransaction(user.id, id, isActive);

    if (!updated) {
      return {
        success: false,
        message: "Transacción recurrente no encontrada",
      };
    }

    revalidatePath("/recurring");

    return {
      success: true,
      message: isActive
        ? "Transacción recurrente activada"
        : "Transacción recurrente pausada",
      data: updated,
    };
  } catch {
    return {
      success: false,
      message:
        "Error al actualizar la transacción recurrente. Por favor, intenta de nuevo.",
    };
  }
}
