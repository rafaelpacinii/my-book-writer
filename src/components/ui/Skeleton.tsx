import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`skeleton-pulse rounded-md ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}

