import Link from "next/link";

interface Category {
  id: string;
  name: string;
  type: string;
}

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.id}`}>
      <div
        className={`
          w-full h-12 p-4 rounded-lg cursor-pointer transition-all
          flex items-center justify-start border border-slate-200 dark:border-none text-slate-700 dark:text-slate-100 shadow-sm
           dark:bg-slate-800 dark:hover:bg-slate-700  hover:shadow-md 
        `}
      >
        <div className="font-medium text-md line-clamp-2">{category.name}</div>
      </div>
    </Link>
  );
}
