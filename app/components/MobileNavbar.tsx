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
    <nav className="fixed w-full shadow-sm bg-gray-800 z-50">
      <div className="flex items-center justify-between px-6 py-4 h-14">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMenuOpen(true)}>
            <Menu className="text-white" />
          </button>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2">
          <span className="text-2xl font-semibold text-white">finansia</span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setIsSheetOpen(true)}>
            <Sparkles className="text-white w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Full-screen overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-gray-800 z-50 animate-in slide-in-from-left duration-300">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex h-14 items-center justify-between  px-6 py-4 border-b border-gray-700 animate-in fade-in duration-300 delay-100">
              <span className="text-2xl font-semibold text-white">
                finansia
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="text-white w-6 h-6" />
              </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 p-6 px-6 py-4">
              <div className="flex flex-col gap-1">
                {navLinks.map(
                  ({ href, label, icon: Icon, className }, index) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`w-full flex items-center gap-3 px-4 py-3 ${className} 
                        hover:text-white hover:bg-gray-700 rounded-lg 
                          ${href.slice(1) == selectedPage ? "bg-gray-800" : ""
                        } `}
                      style={{ animationDelay: `${300 + index * 100}ms` }}
                    >
                      <Icon className="w-5 h-5 group-hover:scale-110 " />
                      <span className="font-medium">{label}</span>
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
