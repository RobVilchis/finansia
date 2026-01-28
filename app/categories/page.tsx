"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CategoryCard from "../components/CategoryCard";
import CategoryDialog from "../components/CategoryDialog";
import { AddButton } from "../components/AddButton";
import { Toast } from "radix-ui";
import { Check } from "lucide-react";

interface Category {
  id: string;
  name: string;
  type: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const timerRef = useRef(0);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al obtener categorías");
      } else {
        setError("Error al obtener categorías");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filter categories based on search term
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const expenseCategories = filteredCategories.filter(
    (cat) => cat.type === "expense"
  );
  const incomeCategories = filteredCategories.filter(
    (cat) => cat.type === "income"
  );

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const onCategoryAdded = () => {
    setOpen(false);
    fetchCategories();

    setToastOpen(false);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setToastOpen(true);
    }, 100);
  };

  return (
    <Toast.Provider swipeDirection="right">
      <section className="container px-5 md:px-10 p-4 min-h-screen flex justify-center w-full">
        <div className="w-full max-w-6xl">
          <h1 className="text-3xl font-bold mb-6">Categorías</h1>

          {/* Search Bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar categoría"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-200   dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <AddButton onClick={() => setOpen(true)} />
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="space-y-3">
                    <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="w-24 h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && !error && (
            <>
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-600 dark:text-gray-400">
                  Gastos
                </h2>
                {expenseCategories.length === 0 ? (
                  <div className="text-gray-400">
                    {searchTerm
                      ? "No se encontraron categorías de gastos que coincidan con la búsqueda."
                      : "No se encontraron categorías de gastos."}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {expenseCategories.map((cat) => (
                      <CategoryCard key={cat.id} category={cat} />
                    ))}
                  </div>
                )}
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-4 text-gray-600 dark:text-gray-400">
                  Ingresos
                </h2>
                {incomeCategories.length === 0 ? (
                  <div className="text-gray-400">
                    {searchTerm
                      ? "No se encontraron categorías de ingresos que coincidan con la búsqueda."
                      : "No se encontraron categorías de ingresos."}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {incomeCategories.map((cat) => (
                      <CategoryCard key={cat.name} category={cat} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
        <CategoryDialog
          open={open}
          onOpenChange={setOpen}
          onCategoryAdded={onCategoryAdded}
        />
        <Toast.Root
          className="pointer-events-auto w-64 grid grid-cols-[auto_max-content] items-center gap-x-[15px] rounded-md bg-green-700 px-[15px] pt-[15px]    pb-[12px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] [grid-template-areas:_'title_action'_'description_action'] data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:animate-hide data-[state=open]:animate-slideIn data-[swipe=end]:animate-swipeOut data-[swipe=cancel]:transition-[transform_200ms_ease-out]"
          open={toastOpen}
          onOpenChange={setToastOpen}
        >
          <div className="flex items-center gap-3">
            <Check className="h-10 w-10 text-white" />
            <Toast.Title className="text-[15px] text-white font-medium">
              ¡La categoría se agregó exitosamente!
            </Toast.Title>
          </div>
        </Toast.Root>
        <Toast.Viewport className="pointer-events-none fixed bottom-4 right-8 z-[2147483647] m-0 flex w-[390px] max-w-[100vw] list-none flex-col gap-2.5 p-[var(--viewport-padding)] outline-none [--viewport-padding:_25px]" />
      </section>
    </Toast.Provider>
  );
}
