"use client";

import { UserButton } from "@clerk/nextjs";
import { BarChart3, Home, CircleDollarSign, AppWindow, Repeat } from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const navLinks = [
  {
    href: "/home",
    label: "Inicio",
    icon: Home,
    className: "text-gray-300",
  },
  {
    href: "/data",
    label: "Datos",
    icon: CircleDollarSign,
    className: "text-gray-300",
  },

  {
    href: "/recurring",
    label: "Recurrentes",
    icon: Repeat,
    className: "text-gray-300",
  },
  {
    href: "/categories",
    label: "Categorías",
    icon: AppWindow,
    className: "text-gray-300",
  },
  {
    href: "/analysis",
    label: "Análisis",
    icon: BarChart3,
    className: "text-gray-300",
  },
  /*     {
    href: "/transactions",
    label: "Transactions",
    icon: CreditCard,
    className: "text-gray-300",
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    className: "text-gray-300",
  }, */
];

export const Sidebar = () => {
  const [selectedPage, setSelectedPage] = useState<string>();

  const pathname = usePathname();
  const page = pathname.split("/")[1];

  useEffect(() => {
    setSelectedPage(page);
  }, [page]);

  /*   const footerLinks = [
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      className: "text-gray-400",
    },
  ]; */

  return (
    <aside className="fixed top-0 left-0 flex flex-col bg-slate-900 dark:bg-slate-900 h-screen w-80 shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          {/* <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div> */}
          <span className="text-3xl font-bold text-white">finansia</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navLinks.map(({ href, label, icon: Icon, className }) => (
          <Link
            key={href}
            href={href}
            className={`w-full flex items-center gap-3 px-4 py-3 ${className} 
            hover:text-white  hover:bg-slate-700 rounded-lg 
            transition-all duration-200 group ${href.slice(1) == selectedPage ? "bg-slate-800" : ""
              } `}
          >
            <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex justify-end p-4 border-t border-slate-700">
        <UserButton></UserButton>
        {/* {footerLinks.map(({ href, label, icon: Icon, className }) => (
          <Link
            key={href}
            href={href}
            className={`w-full flex items-center gap-3 px-4 py-3 ${className} hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 group`}
          >
            <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">{label}</span>
          </Link>
        ))} */}
      </div>
    </aside>
  );
};
