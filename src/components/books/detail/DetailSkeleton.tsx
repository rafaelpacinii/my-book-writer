import React from "react";
import { PageContent } from "@/components/shared/PageContent";
import { Skeleton } from "@/components/ui/Skeleton";

export function DetailSkeleton() {
  return (
    <PageContent>
      <div className="pb-16 flex flex-col gap-6">
        <Skeleton className="h-6 w-24 rounded-md" />
        <Skeleton className="h-10 w-80 rounded-md" />
        <Skeleton className="h-4 w-40 rounded-md" />
      </div>
    </PageContent>
  );
}
