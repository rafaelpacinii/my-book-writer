import { LoadingRegion } from "@/components/ui/LoadingRegion";
import { Skeleton } from "@/components/ui/Skeleton";

export function RouteLoading() {
  return (
    <div className="h-full min-h-0 overflow-auto bg-background p-8 text-foreground">
      <LoadingRegion isLoading label="Abrindo seu espaço de escrita" skeleton={
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      } />
    </div>
  );
}
