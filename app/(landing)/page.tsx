import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SplashClient from "./SplashClient";

export default async function SplashPage() {
  const { userId } = await auth();
  if (userId) redirect("/home");
  return <SplashClient />;
}
