import React from "react";

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  width = "w-full",
  height = "h-4",
}) => {
  return (
    <div
      className={`${width} ${height} bg-gray-300 dark:bg-gray-600 rounded animate-pulse ${className}`}
    />
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between">
        {/* Chart area skeleton */}
        <div className="flex justify-center">
          <div className="w-64 h-64 bg-transparent rounded-full" />
        </div>

        {/* Legend skeleton */}
        <div className="space-y-3 mt-4">
          <Skeleton width="w-32" height="h-3" />
          <Skeleton width="w-32" height="h-3" />
          <Skeleton width="w-32" height="h-3" />
          <Skeleton width="w-32" height="h-3" />
          <Skeleton width="w-32" height="h-3" />
        </div>
      </div>
    </div>
  );
};

export const EmptyStateSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      <div className="flex flex-col items-center justify-center space-y-3 py-8">
        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
        <Skeleton width="w-48" height="h-4" />
        <Skeleton width="w-32" height="h-3" />
      </div>
    </div>
  );
};

export const TextSkeleton: React.FC<{ lines?: number }> = ({ lines = 1 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={
            index === 0 ? "w-full" : index === lines - 1 ? "w-3/4" : "w-5/6"
          }
          height="h-3"
        />
      ))}
    </div>
  );
};
