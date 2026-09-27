import React from "react";

export function LibrarySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex flex-col bg-surface border border-border rounded-xl overflow-hidden shadow-xs"
        >
          <div className="w-full h-44 bg-surface-elevated/60" />
          <div className="p-5 flex flex-col gap-3">
            <div className="h-5 bg-border/60 rounded-md w-3/4" />
            <div className="h-4 bg-border/40 rounded-md w-1/2" />
            <div className="h-3 bg-border/30 rounded-md w-2/3 mt-1" />
            <div className="border-t border-border mt-3 pt-3">
              <div className="h-3 bg-border/30 rounded-md w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
