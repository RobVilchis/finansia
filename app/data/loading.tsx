export default function Loading() {
  return (
    <div className="relative min-h-screen bg-app font-(family-name:--font-outfit)">
      <div className="relative flex justify-center container mx-auto px-8 py-6 min-h-screen">
        <main className="flex flex-col w-full max-w-[500px]">
          {/* Tabs skeleton */}
          <div className="flex gap-1 mb-6 bg-surface backdrop-blur-md border border-edge rounded-xl p-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 h-8 bg-surface-strong rounded-lg animate-pulse"
              />
            ))}
          </div>

          {/* Header skeleton */}
          <div className="flex gap-3 items-center justify-between mb-4">
            <div className="h-8 w-48 bg-surface-strong rounded-lg animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-surface-strong rounded-lg animate-pulse" />
              <div className="h-10 w-10 bg-surface-strong rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Filters skeleton */}
          <div className="h-10 w-full bg-surface-strong rounded-lg animate-pulse mb-4" />

          {/* Day groups */}
          <div className="flex flex-col gap-4 mx-auto">
            {[
              { count: 4 },
              { count: 2 },
            ].map((group, gi) => (
              <div key={gi}>
                <div className="h-3 w-32 bg-surface-strong rounded animate-pulse mb-2 ml-1" />
                <div className="space-y-2">
                  {Array.from({ length: group.count }).map((_, i) => (
                    <div
                      key={i}
                      className="w-full py-3 px-4 rounded-xl bg-surface backdrop-blur-md border border-edge-soft"
                    >
                      <div className="flex justify-between items-center gap-3">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="h-4 w-3/4 bg-surface-strong rounded animate-pulse" />
                          <div className="h-3 w-1/3 bg-surface-strong rounded animate-pulse" />
                        </div>
                        <div className="h-5 w-20 bg-surface-strong rounded animate-pulse shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
