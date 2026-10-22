import { Skeleton } from "@/components/ui/Skeleton";

export function HomeSkeleton() {
  return (
    <div className="resume-card">
      <div className="flex min-w-0 flex-col gap-4">
        <Skeleton className="h-3 w-40 max-w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="mt-1 h-10 w-36" />
      </div>
      <div className="resume-visual"><Skeleton className="h-40 w-28" /></div>
    </div>
  );
}
