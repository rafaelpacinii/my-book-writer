import { Skeleton } from "@/components/ui/Skeleton";

export function LibrarySkeleton() {
  return (
    <div>
      <Skeleton className="mb-5 h-8 w-36" />
      <Skeleton className="mb-5 h-11 w-full" />
      <div className="book-grid">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="book-card">
            <Skeleton className="book-stage w-full" />
            <div className="book-info">
              <Skeleton className="h-14 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
              <Skeleton className="mt-3 h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
