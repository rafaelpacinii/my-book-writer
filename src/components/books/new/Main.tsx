"use client";

import { PageContent } from "@/components/shared/PageContent";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingRegion } from "@/components/ui/LoadingRegion";
import { NewBookHeader } from "@/components/books/new/NewBookHeader";
import { NewBookForm } from "@/components/books/new/NewBookForm";
import { NewBookSkeleton } from "@/components/books/new/NewBookSkeleton";
import { useNewBookForm } from "@/hooks/useNewBookForm";

export function Main() {
  const form = useNewBookForm();
  return (
    <PageContent>
      <NewBookHeader />
      {form.loadError && <ErrorState message={form.loadError} onRetry={form.retry} />}
      {(!form.loadError || form.hasData) && (
        <LoadingRegion isLoading={form.isLoading} label="Preparando seu novo livro" skeleton={<NewBookSkeleton />}>
          <NewBookForm form={form} />
        </LoadingRegion>
      )}
    </PageContent>
  );
}
