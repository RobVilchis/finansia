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
          w-40 h-18 p-4 rounded-lg cursor-pointer transition-all
          flex items-center justify-start bg-slate-700 hover:bg-slate-500 text-slate-200
        `}
      >
        <div className="font-medium text-md line-clamp-2">{category.name}</div>
      </div>
    </Link>
  );
}
