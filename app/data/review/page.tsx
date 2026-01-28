import { getUnverifiedTransactions } from "@/lib/services/transactions";
import { currentUser } from "@clerk/nextjs/server";
import { cache, Suspense } from "react";
import ReviewPageClient from "./ReviewPageClient";

// Per-request deduplication with React.cache()
// This ensures the query only runs once per request even if called multiple times
const getCachedUnverifiedTransactions = cache(async (userId: string) => {
  return await getUnverifiedTransactions(userId);
});

async function ReviewPageContent() {
  const user = await currentUser();
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">No autorizado</p>
      </div>
    );
  }

  const transactions = await getCachedUnverifiedTransactions(user.id);

  return <ReviewPageClient initialTransactions={transactions} />;
}

function LoadingSkeleton() {
  return (
    <div className="flex justify-center container mx-auto px-8 py-4 min-h-screen">
      <main className="flex flex-col w-full max-w-[500px]">
        <div className="grow">
          <div className="flex flex-col md:flex-row mb-4 gap-3 md:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              <div className="w-48 h-7 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="py-3 px-4 bg-slate-100 dark:bg-slate-800 rounded-md font-medium dark:text-slate-300 text-slate-500 mb-4">
            <div className="w-64 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
          <div className="grid gap-4 mx-auto">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="space-y-3">
                    <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="w-48 h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="w-24 h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ReviewPageContent />
    </Suspense>
  );
}
