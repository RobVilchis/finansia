"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  useEffect(() => {
    fetch("/api/create-user");
  }, []);
  redirect("/home");
}
