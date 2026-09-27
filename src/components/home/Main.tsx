"use client";

import React from "react";
import { useProfile } from "@/hooks/useProfile";
import { useBooks } from "@/hooks/useBooks";
import { AppShell } from "@/components/shared/AppShell";
import { Greeting } from "./Greeting";
import { ContinueCard } from "./ContinueCard";
import { EmptyHomeCard } from "./EmptyHomeCard";
import { ActionCards } from "./ActionCards";
import { PersistenceNotice } from "./PersistenceNotice";

export function Main() {
  const { profile } = useProfile();
  const { books, isLoading } = useBooks(profile?.id);

  const latestBook = React.useMemo(() => {
    if (!books || books.length === 0) return null;
    return [...books].sort((a, b) => {
      const timeA = new Date(a.updated_at || a.created_at).getTime();
      const timeB = new Date(b.updated_at || b.created_at).getTime();
      return timeB - timeA;
    })[0];
  }, [books]);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-8">
        <Greeting />

        {isLoading ? (
          <div className="w-full h-64 rounded-2xl bg-surface border border-border animate-pulse" />
        ) : latestBook ? (
          <ContinueCard book={latestBook} />
        ) : (
          <EmptyHomeCard />
        )}

        <ActionCards booksCount={books.length} />
        <PersistenceNotice />
      </div>
    </AppShell>
  );
}
