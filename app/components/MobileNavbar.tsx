"use client";

import { Menu, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks } from "./Sidebar";
import { useChatContext } from "../contexts/ChatContext";

export default function Navbar() {
  const [selectedPage, setSelectedPage] = useState<string>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { setIsSheetOpen } = useChatContext();

  const pathname = usePathname();
  const page = pathname.split("/")[1];

  useEffect(() => {
    setSelectedPage(page);
  }, [page]);

  return (
    <nav className="fixed w-full bg-gray-950 border-b border-white/8 z-50 font-(family-name:--font-outfit)">
      <div className="flex items-center justify-between px-6 h-14">
        <button onClick={() => setIsMenuOpen(true)} className="text-white/50 hover:text-white transition-colors cursor-pointer">
          <Menu className="w-5 h-5" />
        </button>

        <span className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-white tracking-tight">
          finansia
        </span>

        <button onClick={() => setIsSheetOpen(true)} className="text-white/50 hover:text-white transition-colors cursor-pointer">
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-gray-950 z-50">
          <div className="flex flex-col h-full">
            <div className="flex h-14 items-center justify-between px-6 border-b border-white/8">
              <span className="text-lg font-semibold text-white tracking-tight">finansia</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-white/50 hover:text-white hover:bg-white/6 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 space-y-1">
              {navLinks.map(({ href, label, icon: Icon }, index) => {
                const isActive = href.slice(1) === selectedPage;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
                      ${isActive
                        ? "bg-white/10 text-white"
                        : "text-white/40 hover:text-white/80 hover:bg-white/6"
                      }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
