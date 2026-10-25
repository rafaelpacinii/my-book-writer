import { Skeleton } from "@/components/ui/Skeleton";

export function CodexSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[0, 1, 2, 3].map((key) => (
        <div key={key} className="overflow-hidden rounded-xl border border-border bg-surface">
          <Skeleton className="h-40 rounded-none" />
          <div className="space-y-3 p-4"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-full" /></div>
        </div>
      ))}
    </div>
  );
}
