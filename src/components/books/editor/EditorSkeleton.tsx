import React from "react";
import { PageContent } from "@/components/shared/PageContent";
import { Skeleton } from "@/components/ui/Skeleton";

export function EditorSkeleton() {
  return (
    <PageContent>
      <div className="max-w-4xl mx-auto py-10 flex flex-col gap-6">
        <Skeleton className="h-6 w-32 rounded-md" />
        <Skeleton className="h-10 w-96 rounded-md" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </PageContent>
  );
}
