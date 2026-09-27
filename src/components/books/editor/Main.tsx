"use client";

import React from "react";
import { AppShell } from "@/components/shared/AppShell";
import { EditorHeader } from "./EditorHeader";
import { EditorTitleInput } from "./EditorTitleInput";
import { EditorCanvas } from "./EditorCanvas";
import { EditorNav } from "./EditorNav";
import { EditorFooter } from "./EditorFooter";
import { EditorSkeleton } from "./EditorSkeleton";
import { EditorNotFound } from "./EditorNotFound";
import { DeleteChapterModal } from "./DeleteChapterModal";
import { useChapterEditor } from "./useChapterEditor";

interface Props {
  bookId: string;
  chapterId: string;
}

export function Main({ bookId, chapterId }: Props) {
  const ed = useChapterEditor(bookId, chapterId);
  const chapterNumber = `Capítulo ${String(ed.currentIndex + 1).padStart(2, "0")}`;

  if (ed.isLoading && !ed.chapter) return <EditorSkeleton />;
  if (!ed.chapter) return <EditorNotFound bookId={bookId} />;

  const content = (
    <div className={`mx-auto flex flex-col min-h-screen ${ed.isFocusMode ? "max-w-3xl px-6 py-6" : "max-w-4xl px-4 sm:px-6"}`}>
      <EditorHeader
        bookId={bookId}
        bookTitle={ed.book?.title}
        chapterNumber={chapterNumber}
        saveStatus={ed.saveStatus}
        isFocusMode={ed.isFocusMode}
        onToggleFocus={() => ed.setIsFocusMode(!ed.isFocusMode)}
        onSave={ed.saveNow}
        onDeleteClick={() => ed.setIsDeleteModalOpen(true)}
      />
      <main className="flex-1 flex flex-col py-6">
        <EditorTitleInput chapterNumber={chapterNumber} title={ed.title} onChange={ed.setTitle} />
        <EditorCanvas text={ed.text} onChange={ed.setText} fontSizePt={ed.book?.font_size_pt} lineHeightRatio={ed.book?.line_height_ratio} />
        <EditorNav bookId={bookId} prevChapter={ed.prevChapter} nextChapter={ed.nextChapter} />
      </main>
      <EditorFooter wordCount={ed.wordCount} charCount={ed.charCount} readingTime={ed.readingTime} lastSavedAt={ed.lastSavedAt} />
      <DeleteChapterModal isOpen={ed.isDeleteModalOpen} onClose={() => ed.setIsDeleteModalOpen(false)} onConfirm={ed.handleDeleteChapter} chapterTitle={ed.title} />
    </div>
  );

  return ed.isFocusMode ? <div className="min-h-screen bg-background text-foreground">{content}</div> : <AppShell>{content}</AppShell>;
}
