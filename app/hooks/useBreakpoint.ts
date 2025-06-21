"use client";

import { useState, useEffect } from "react";

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<"sm" | "md" | "lg">("sm");

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      if (width >= 1024) setBreakpoint("lg");
      else if (width >= 768) setBreakpoint("md");
      else setBreakpoint("sm");
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return breakpoint;
}
