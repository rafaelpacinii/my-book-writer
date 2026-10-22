"use client";

import { PageContent } from "@/components/shared/PageContent";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingRegion } from "@/components/ui/LoadingRegion";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { LibraryContent } from "@/components/library/LibraryContent";
import { LibrarySkeleton } from "@/components/library/LibrarySkeleton";
import { useLibrary } from "@/hooks/useLibrary";

export function Main() {
  const lib = useLibrary();
  return (
    <PageContent>
      <LibraryHeader />
      {lib.error && <ErrorState message={lib.error} onRetry={lib.retry} />}
      {(!lib.error || lib.books.length > 0) && (
        <LoadingRegion isLoading={lib.isLoading} label="Carregando biblioteca" skeleton={<LibrarySkeleton />}>
          <LibraryContent lib={lib} />
        </LoadingRegion>
      )}
    </PageContent>
  );
}
