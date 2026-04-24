export default function Loading() {
  return (
    <div className="flex justify-center container mx-auto px-8 py-4 min-h-screen">
      <main className="flex flex-col w-full max-w-[500px]">
        <div className="grow">
          {/* Tabs skeleton */}
          <div className="mb-4 flex gap-2">
            <div className="h-10 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="h-10 w-28 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>

          {/* Header skeleton - matches transactions tab by default */}
          <div className="flex gap-3 items-center justify-between mb-8">
            <div className="h-8 w-48 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Content skeleton - transaction cards */}
          <div className="grid gap-4 mx-auto">
            {/* Day header skeleton */}
            <div className="h-6 w-40 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2"></div>

            {/* Transaction cards skeleton */}
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                      <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Another day group */}
            <div className="mt-6">
              <div className="h-6 w-40 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                        <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                      </div>
                      <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
