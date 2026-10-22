import { Skeleton } from "@/components/ui/Skeleton";

export function LibrarySkeleton() {
  return (
    <div>
      <Skeleton className="mb-5 h-8 w-36" />
      <Skeleton className="mb-5 h-11 w-full" />
      <div className="book-grid">
        {[0, 1, 2].map((index) => (
          <div key={index}>
            <Skeleton className="h-[184px] w-full rounded-lg" />
            <Skeleton className="mt-4 h-6 w-3/4" />
            <Skeleton className="mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
