"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingRegion } from "@/components/ui/LoadingRegion";
import { Skeleton } from "@/components/ui/Skeleton";
import { SheetContent } from "@/components/codex/sheet/SheetContent";
import { useCodexSheetPage } from "@/hooks/useCodexSheetPage";
import { useCodexWorkspace } from "@/hooks/useCodexWorkspace";
import styles from "@/components/codex/codexWorkspace.module.css";

export function Main() {
  const page = useCodexSheetPage();
  const hub = useCodexWorkspace();
  const error = hub.error ?? page.error;
  return (
    <div className={styles.sheet}>
      {error && <ErrorState message={error} onRetry={hub.error ? hub.retry : page.retry} />}
      {(!error || page.sheet) && (
        <LoadingRegion isLoading={page.isLoading} label="Carregando ficha" skeleton={<Skeleton className="h-96" />}>
          {page.sheet && page.scope && <SheetContent key={page.sheet.entity.id} sheet={page.sheet} scope={page.scope}
            archived={page.archived} />}
        </LoadingRegion>
      )}
    </div>
  );
}
