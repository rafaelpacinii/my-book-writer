"use client";

import { BookSectionPage } from "@/components/books/shared/BookSectionPage";
import { BookSectionHeader } from "@/components/books/shared/BookSectionHeader";
import { ErrorState } from "@/components/shared/ErrorState";
import { DetailNotFound } from "@/components/books/detail/DetailNotFound";
import { DiscardChangesModal } from "@/components/books/settings/DiscardChangesModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useBookFrontMatterPage } from "@/hooks/useBookFrontMatterPage";
import { FrontMatterForm } from "@/components/books/frontMatter/FrontMatterForm";

export function Main({ bookId }: { bookId: string }) {
  const state = useBookFrontMatterPage(bookId);
  if (!state.isLoading && !state.book && !state.error) return <DetailNotFound />;
  return (
    <BookSectionPage>
      <BookSectionHeader bookId={bookId} bookTitle={state.book?.title} current="Páginas iniciais"
        title="Páginas iniciais" description="Organize as páginas que apresentam sua obra antes do primeiro capítulo." />
      {state.isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : !state.form || !state.book ? (
        <ErrorState message={state.error || "Não foi possível carregar as páginas iniciais."} onRetry={state.retry} />
      ) : <FrontMatterForm state={state} />}
      <DiscardChangesModal isOpen={state.navigation.isOpen} onClose={state.navigation.close} onDiscard={state.navigation.confirm} />
    </BookSectionPage>
  );
}
