"use client";

import { useEffect, useState } from "react";
import CategoryCard from "../components/CategoryCard";

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

  useEffect(() => {
    const fetchCategories = async () => {
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
    };
    fetchCategories();
  }, []);

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

  return (
    <section className="container px-5 md:px-10 p-4 min-h-screen flex justify-center w-full">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Categorías</h1>

        {/* Search Bar */}
        <div className="mb-6 relative max-w-md">
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
            className="w-full pl-10 pr-4 py-2  bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
              <h2 className="text-xl font-semibold mb-4 text-gray-400">
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
              <h2 className="text-xl font-semibold mb-4 text-gray-400">
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
    </section>
  );
}
