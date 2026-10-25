import { Skeleton } from "@/components/ui/Skeleton";

export function CodexSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {[0, 1, 2, 3].map((key) => (
        <div key={key} className="flex items-center gap-3 py-2">
          <Skeleton className="h-14 w-11 shrink-0" />
          <div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-full" /></div>
        </div>
      ))}
    </div>
  );
}
