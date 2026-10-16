import React from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";

export function DetailSkeleton() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto pb-16 flex flex-col gap-6">
        <Skeleton className="h-6 w-24 rounded-md" />
        <Skeleton className="h-10 w-80 rounded-md" />
        <Skeleton className="h-4 w-40 rounded-md" />
      </div>
    </AppShell>
  );
}
