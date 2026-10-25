import { Skeleton } from "@/components/ui/Skeleton";
import { WorkspaceGrid } from "@/components/shared/WorkspaceGrid";

export function CodexSkeleton() {
  return (
    <WorkspaceGrid>
      {[0, 1, 2, 3].map((key) => (
        <div key={key} className="workspace-card overflow-hidden">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="space-y-3 px-5 pt-[18px] pb-4"><Skeleton className="h-7 w-2/3" /><Skeleton className="h-4 w-full" /></div>
        </div>
      ))}
    </WorkspaceGrid>
  );
}
