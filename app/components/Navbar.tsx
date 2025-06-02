import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="w-full shadow-sm bg-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-white">Finance AI</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 text-sm font-medium hover:text-gray-900 text-gray-200 dark:hover:text-white">
            Overview
          </button>
          <button className="px-4 py-2 text-sm font-medium hover:text-gray-900 text-gray-200 dark:hover:text-white">
            Reports
          </button>
          <UserButton></UserButton>
        </div>
      </div>
    </nav>
  );
}
