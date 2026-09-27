"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/shared/AppShell";
import { BookDetailHeader } from "./BookDetailHeader";
import { ChaptersSectionHeader } from "./ChaptersSectionHeader";
import { ChaptersGrid } from "./ChaptersGrid";
import { NewChapterModal } from "./NewChapterModal";
import { useBookDetail } from "./useBookDetail";

interface Props {
  bookId: string;
}

export function Main({ bookId }: Props) {
  const detail = useBookDetail(bookId);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto pb-16">
        {detail.isLoading && !detail.book ? (
          <div className="flex flex-col gap-6 animate-pulse">
            <div className="h-6 w-24 bg-border/40 rounded-md" />
            <div className="h-10 w-80 bg-border/60 rounded-md" />
            <div className="h-4 w-40 bg-border/40 rounded-md" />
          </div>
        ) : !detail.book ? (
          <div className="p-8 text-center bg-surface border border-border rounded-xl">
            <h2 className="font-serif text-2xl font-normal text-foreground">Livro não encontrado</h2>
            <Link href="/library" className="text-sm font-bold text-primary mt-4 inline-block hover:underline">
              Voltar para a biblioteca
            </Link>
          </div>
        ) : (
          <>
            <BookDetailHeader
              book={detail.book}
              formatName={detail.formatName}
              fontName={detail.fontName}
            />

            <ChaptersSectionHeader chaptersCount={detail.chapters.length} />

            <ChaptersGrid
              chapters={detail.chapters}
              bookId={bookId}
              onNewChapter={() => detail.setIsModalOpen(true)}
            />

            <NewChapterModal
              isOpen={detail.isModalOpen}
              onClose={() => detail.setIsModalOpen(false)}
              onCreate={detail.handleCreateChapter}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
