"use client";

import { ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

export default function SplashClient() {
  return (
    <main className="relative min-h-screen bg-app flex items-center justify-center overflow-hidden font-(family-name:--font-outfit)">
      {/* Ambient background orbs */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        aria-hidden="true"
      >
        <div
          className="absolute rounded-full"
          style={{
            width: 640,
            height: 640,
            top: "5%",
            left: "10%",
            background:
              "radial-gradient(circle, oklch(0.79 0.155 210 / 0.13) 0%, transparent 65%)",
            filter: "blur(8px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 520,
            height: 520,
            bottom: "8%",
            right: "8%",
            background:
              "radial-gradient(circle, oklch(0.78 0.18 154 / 0.08) 0%, transparent 65%)",
            filter: "blur(8px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 300,
            height: 300,
            top: "55%",
            left: "55%",
            background:
              "radial-gradient(circle, oklch(0.72 0.21 17 / 0.05) 0%, transparent 65%)",
            filter: "blur(8px)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6">
        {/* Icon medallion */}
        <div
          className="splash-item"
          style={{ "--delay": "0ms" } as CSSProperties}
        >
          <div className="w-16 h-16 rounded-2xl bg-surface border border-edge backdrop-blur-md flex items-center justify-center text-accent shadow-xl shadow-black/40">
            <BarChart3 size={28} strokeWidth={1.5} />
          </div>
        </div>

        {/* Title + tagline */}
        <div
          className="splash-item flex flex-col gap-2"
          style={{ "--delay": "90ms" } as CSSProperties}
        >
          <h1 className="text-[3.25rem] font-bold text-ink tracking-tight leading-none">
            Finansia
          </h1>
          <p className="text-base text-ink-muted">
            Tus finanzas personales, con IA.
          </p>
        </div>

        {/* CTA */}
        <div
          className="splash-item mt-1"
          style={{ "--delay": "210ms" } as CSSProperties}
        >
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-6 py-[11px] rounded-xl text-sm font-medium bg-accent-soft border border-accent-border text-accent-fg hover:bg-accent/30 hover:text-cyan-100 hover:border-cyan-400/50 transition-all"
          >
            Entrar <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <style>{`
        .splash-item {
          animation: splashFadeUp 0.75s calc(var(--delay, 0ms)) cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes splashFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </main>
  );
}
