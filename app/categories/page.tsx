"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, TextField } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import z, { set } from "zod";
import CategoryDialog from "../components/CategoryDialog";
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

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const expenseCategories = categories.filter((cat) => cat.type === "expense");
  const incomeCategories = categories.filter((cat) => cat.type === "income");

  return (
    <div className="container px-5 md:px-10 p-4 min-h-screen w-full">
      <h1 className="text-3xl font-bold mb-6">Categories</h1>
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Expense Categories</h2>
            {expenseCategories.length === 0 ? (
              <div className="text-gray-400">No expense categories found.</div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {expenseCategories.map((cat) => (
                  <CategoryCard key={cat.id} category={cat} />
                ))}
              </div>
            )}
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-4">Income Categories</h2>
            {incomeCategories.length === 0 ? (
              <div className="text-gray-400">No income categories found.</div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {incomeCategories.map((cat) => (
                  <CategoryCard key={cat.name} category={cat} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
      {selectedCategory && (
        <CategoryDialog
          open={dialogOpen}
          category={selectedCategory}
          onOpenChange={setDialogOpen}
          onDelete={function (id: string): void {
            throw new Error("Function not implemented.");
          }}
          onCategoryUpdated={() => {}}
        ></CategoryDialog>
      )}
    </div>
  );
}
