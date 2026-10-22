"use client";

import type { ReactNode } from "react";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";

interface Props {
  isLoading: boolean;
  label: string;
  skeleton: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function LoadingRegion({ isLoading, label, skeleton, children, className }: Props) {
  const showSkeleton = useDelayedLoading(isLoading);
  return (
    <div aria-busy={isLoading} className={className}>
      {isLoading ? (
        <>
          <span role="status" className="sr-only">{label}</span>
          <div className={showSkeleton ? "" : "invisible"} data-loading-placeholder>
            {skeleton}
          </div>
        </>
      ) : children}
    </div>
  );
}
