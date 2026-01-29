import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema/account";
import { categories } from "@/lib/db/schema/categories";
import { users } from "@/lib/db/schema/user";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await currentUser();

  if (!user) return new Response("Unauthorized", { status: 401 });

  const existing = await db.select().from(users).where(eq(users.id, user.id));

  if (existing.length == 0) {
    await db.insert(users).values({
      id: user.id,
      email: user.emailAddresses[0].emailAddress || "",
    });

    await db.insert(accounts).values([
      {
        userId: user.id,
        name: "Tarjeta",
      },
      {
        userId: user.id,
        name: "Efectivo",
      },
    ]);

    await db.insert(categories).values([
      { userId: user.id, name: "Alimentación" },
      { userId: user.id, name: "Transporte" },
      { userId: user.id, name: "Vivienda" },
      { userId: user.id, name: "Salud" },
      { userId: user.id, name: "Educación" },
      { userId: user.id, name: "Ocio" },
      { userId: user.id, name: "Servicios" },
      { userId: user.id, name: "Restaurantes" },
      { userId: user.id, name: "Telefonía" },
      { userId: user.id, name: "Higiene" },
      { userId: user.id, name: "Familia" },
      { userId: user.id, name: "Ropa" },
      { userId: user.id, name: "Otros" },
      { userId: user.id, name: "Sueldo", type: "income" },
    ]);
  }

  return new Response("User OK");
}
