export default function Loading() {
  const dayGroups = [
    { label: "w-40", rows: 4 },
    { label: "w-32", rows: 2 },
  ];

  return (
    <div className="flex justify-center container mx-auto px-8 pt-4 pb-28 min-h-screen">
      <main className="flex flex-col w-full max-w-[680px]">
        <div className="grow">
          {/* Segmented tab bar skeleton — mirrors GlassSegmented */}
          <div className="mb-4 flex gap-1 bg-surface backdrop-blur-md border border-edge rounded-xl p-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 h-7 bg-surface-strong rounded-lg animate-pulse"
              />
            ))}
          </div>

          {/* Header skeleton — title + actions */}
          <div className="flex gap-3 items-center justify-between mb-4">
            <div className="h-8 w-48 bg-surface-strong rounded-lg animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-surface-strong rounded-lg animate-pulse" />
              <div className="h-9 w-9 bg-surface-strong rounded-full animate-pulse" />
            </div>
          </div>

          {/* Filters bar skeleton */}
          <div className="h-11 w-full bg-surface border border-edge-soft rounded-xl animate-pulse mb-4" />

          {/* Transaction groups skeleton */}
          <div className="grid gap-4 mx-auto">
            {dayGroups.map((group, gi) => (
              <div key={gi}>
                {/* Day divider */}
                <div className="flex items-center gap-3 mb-2 mt-4 first:mt-1">
                  <div
                    className={`h-2.5 ${group.label} bg-surface-strong rounded-full animate-pulse shrink-0`}
                  />
                  <div className="flex-1 h-px bg-edge-soft" />
                </div>

                {/* Cards — mirror TransactionCard */}
                <div className="space-y-2">
                  {Array.from({ length: group.rows }).map((_, ri) => (
                    <div
                      key={ri}
                      className="w-full flex justify-between items-center gap-3 py-3 px-4
                        bg-surface backdrop-blur-md rounded-xl border border-edge-soft
                        shadow-lg shadow-black/10"
                    >
                      <div className="flex flex-col gap-2 min-w-0 flex-1">
                        <div className="h-4 w-3/5 bg-surface-strong rounded animate-pulse" />
                        <div className="h-3 w-2/5 bg-surface-strong rounded animate-pulse" />
                      </div>
                      <div className="h-5 w-20 bg-surface-strong rounded animate-pulse shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
