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
      className={`${width} ${height} bg-surface-strong rounded animate-pulse ${className}`}
    />
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className="w-16 h-16 bg-surface-strong rounded-full animate-pulse" />
      <Skeleton width="w-48" height="h-4" />
      <Skeleton width="w-32" height="h-3" />
    </div>
  );
};

export const TextSkeleton: React.FC<{ lines?: number }> = ({ lines = 1 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === 0 ? "w-full" : index === lines - 1 ? "w-3/4" : "w-5/6"}
          height="h-3"
        />
      ))}
    </div>
  );
};
