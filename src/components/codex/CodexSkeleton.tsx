import { Skeleton } from "@/components/ui/Skeleton";
import styles from "@/components/codex/codexCatalog.module.css";

export function CodexSkeleton() {
  return (
    <div className={styles.grid}>
      {[0, 1, 2, 3].map((key) => (
        <div key={key} className="overflow-hidden rounded-xl border border-border">
          <Skeleton className="h-52 w-full rounded-none" />
          <div className="space-y-3 p-5"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-3 w-full" /></div>
        </div>
      ))}
    </div>
  );
}
