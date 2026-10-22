import { Skeleton } from "@/components/ui/Skeleton";

export function NewBookSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-6 lg:col-span-7">
        <Skeleton className="h-6 w-48" />
        {[0, 1, 2, 3].map((index) => <Skeleton key={index} className="h-16 w-full" />)}
      </div>
      <Skeleton className="h-96 w-full rounded-xl lg:col-span-5" />
    </div>
  );
}
