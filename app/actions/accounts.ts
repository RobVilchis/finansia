"use server";

import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema/account";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { DrizzleQueryError } from "drizzle-orm/errors";
import { revalidatePath } from "next/cache";
import { DatabaseError } from "pg";
import { AccountFormData } from "../components/NewAccountDialog";
/**
 * Server Actions for accounts
 * These functions can be called directly from client components
 */

export async function createAccountAction(data: AccountFormData) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "No autorizado" };
    }

    // Check if account with this name already exists for the user
    const existingAccount = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.name, data.name), eq(accounts.userId, user.id)));

    if (existingAccount.length > 0) {
      return {
        success: false,
        message: "Ya existe una cuenta con este nombre",
      };
    }

    const newAccount = await db
      .insert(accounts)
      .values({
        name: data.name,
        type: data.type,
        userId: user.id,
      })
      .returning();

    revalidatePath("/data");
    revalidatePath("/home");

    return {
      success: true,
      message: "Cuenta creada exitosamente",
      data: newAccount[0],
    };
  } catch (error) {
    if (error instanceof DrizzleQueryError) {
      if (error.cause instanceof DatabaseError) {
        // Unique constraint violation
        if (error.cause.code === "23505") {
          return {
            success: false,
            message: "Ya existe una cuenta con este nombre",
          };
        }
        // Not null violation
        if (error.cause.code === "23502") {
          return { success: false, message: "Faltan campos requeridos" };
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
      message: "Error al crear la cuenta. Por favor, intenta de nuevo.",
    };
  }
}

export async function updateAccountAction(id: string, data: AccountFormData) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "No autorizado" };
    }

    // First check if the account belongs to the user
    const existingAccount = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)));

    if (existingAccount.length === 0) {
      return {
        success: false,
        message: "Cuenta no encontrada o no autorizada",
      };
    }

    const updatedAccount = await db
      .update(accounts)
      .set({
        name: data.name,
        type: data.type,
      })
      .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)))
      .returning();

    if (!updatedAccount.length) {
      return { success: false, message: "Cuenta no encontrada" };
    }

    revalidatePath("/data");
    revalidatePath("/home");

    return {
      success: true,
      message: "Cuenta actualizada exitosamente",
      data: updatedAccount[0],
    };
  } catch (error) {
    if (error instanceof DrizzleQueryError) {
      if (error.cause instanceof DatabaseError) {
        // Unique constraint violation
        if (error.cause.code === "23505") {
          return {
            success: false,
            message: "Ya existe una cuenta con este nombre",
          };
        }
        // Not null violation
        if (error.cause.code === "23502") {
          return { success: false, message: "Faltan campos requeridos" };
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
      message: "Error al actualizar la cuenta. Por favor, intenta de nuevo.",
    };
  }
}

export async function deleteAccountAction(id: string) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "No autorizado" };
    }

    // First check if the account belongs to the user
    const existingAccount = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)));

    if (existingAccount.length === 0) {
      return {
        success: false,
        message: "Cuenta no encontrada o no autorizada",
      };
    }

    await db
      .delete(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)));

    revalidatePath("/data");
    revalidatePath("/home");

    return { success: true, message: "Cuenta eliminada exitosamente" };
  } catch (error) {
    if (error instanceof DrizzleQueryError) {
      if (error.cause instanceof DatabaseError) {
        // Foreign key violation - account has dependent records
        if (error.cause.code === "23503") {
          return {
            success: false,
            message:
              "Esta cuenta tiene transacciones asociadas y no puede ser eliminada.",
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
      message: "Error al eliminar la cuenta. Por favor, intenta de nuevo.",
    };
  }
}
