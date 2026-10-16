import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export function LibrarySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex flex-col bg-surface border border-border rounded-xl overflow-hidden shadow-xs"
        >
          <Skeleton className="w-full aspect-[3/2] rounded-none border-b border-border" />
          <div className="p-5 flex flex-col gap-3">
            <Skeleton className="h-5 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
            <Skeleton className="h-3 w-2/3 rounded-md mt-1" />
            <div className="border-t border-border mt-3 pt-3">
              <Skeleton className="h-3 w-1/3 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
