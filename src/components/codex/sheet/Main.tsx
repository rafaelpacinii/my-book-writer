"use client";

import { PageContent } from "@/components/shared/PageContent";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingRegion } from "@/components/ui/LoadingRegion";
import { Skeleton } from "@/components/ui/Skeleton";
import { SheetContent } from "@/components/codex/sheet/SheetContent";
import { useCodexSheetPage } from "@/hooks/useCodexSheetPage";

export function Main() {
  const page = useCodexSheetPage();
  return (
    <PageContent>
      {page.error && <ErrorState message={page.error} onRetry={page.retry} />}
      {(!page.error || page.sheet) && (
        <LoadingRegion isLoading={page.isLoading} label="Carregando ficha" skeleton={<Skeleton className="h-96" />}>
          {page.sheet && page.scope && <SheetContent key={page.sheet.entity.id} sheet={page.sheet} scope={page.scope}
            archived={page.archived} />}
        </LoadingRegion>
      )}
    </PageContent>
  );
}
