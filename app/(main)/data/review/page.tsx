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
      <main className="flex flex-col w-full max-w-[680px]">
        <div className="grow">
          {/* Header skeleton */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-surface-strong rounded-lg animate-pulse" />
            <div className="w-52 h-7 bg-surface-strong rounded-lg animate-pulse" />
          </div>
          {/* Info banner skeleton */}
          <div className="flex items-start gap-3 p-4 bg-surface border border-edge rounded-xl mb-4">
            <div className="w-4 h-4 bg-surface-strong rounded animate-pulse shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="w-full h-3 bg-surface-strong rounded animate-pulse" />
              <div className="w-3/4 h-3 bg-surface-strong rounded animate-pulse" />
            </div>
          </div>
          {/* Cards skeleton */}
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface border border-edge-soft rounded-xl px-4 py-3 flex items-center justify-between gap-3"
              >
                <div className="w-36 h-4 bg-surface-strong rounded animate-pulse" />
                <div className="w-20 h-4 bg-surface-strong rounded animate-pulse" />
              </div>
            ))}
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
