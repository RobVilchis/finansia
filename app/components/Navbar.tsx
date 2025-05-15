import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm dark:bg-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/next.svg"
            alt="Logo"
            width={100}
            height={24}
            className="dark:invert"
          />
          <span className="text-xl font-semibold dark:text-white">Finance Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
            Overview
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
            Reports
          </button>
        </div>
      </div>
    </nav>
  );
} 