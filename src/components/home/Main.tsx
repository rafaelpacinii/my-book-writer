"use client";

import { useProfile } from "@/hooks/useProfile";
import { useBooks } from "@/hooks/useBooks";
import { PageContent } from "@/components/shared/PageContent";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingRegion } from "@/components/ui/LoadingRegion";
import { Greeting } from "@/components/home/Greeting";
import { ContinueCard } from "@/components/home/ContinueCard";
import { EmptyHomeCard } from "@/components/home/EmptyHomeCard";
import { ActionCards } from "@/components/home/ActionCards";
import { PersistenceNotice } from "@/components/home/PersistenceNotice";
import { HomeSkeleton } from "@/components/home/HomeSkeleton";

export function Main() {
  const profile = useProfile();
  const books = useBooks(profile.profile?.id);
  const isLoading = profile.isLoading || books.isLoading;
  const error = profile.error || books.error;
  const latestBook = [...books.books].sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];
  const retry = () => { void profile.refreshProfile(); void books.refreshBooks(); };

  return (
    <PageContent>
      <Greeting />
      {error && <ErrorState message={error} onRetry={retry} />}
      {(!error || books.books.length > 0) && (
        <LoadingRegion isLoading={isLoading} label="Carregando seus livros" skeleton={<HomeSkeleton />}>
          {latestBook ? <ContinueCard book={latestBook} /> : <EmptyHomeCard />}
        </LoadingRegion>
      )}
      <ActionCards booksCount={isLoading ? undefined : books.books.length} />
      <PersistenceNotice />
    </PageContent>
  );
}
