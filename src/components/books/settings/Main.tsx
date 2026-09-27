"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/shared/AppShell";
import { SettingsHeader } from "./SettingsHeader";
import { SettingsForm } from "./SettingsForm";
import { DeleteBookModal } from "./DeleteBookModal";
import { DiscardChangesModal } from "./DiscardChangesModal";
import { useBookSettings } from "./useBookSettings";

interface Props {
  bookId: string;
}

export function Main({ bookId }: Props) {
  const s = useBookSettings(bookId);

  if (s.isLoading && !s.book) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto pb-16 animate-pulse flex flex-col gap-6">
          <div className="h-6 w-24 bg-border/40 rounded-md" />
          <div className="h-10 w-80 bg-border/60 rounded-md" />
          <div className="h-96 w-full bg-border/20 rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (!s.book) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto pb-16 p-8 text-center bg-surface border border-border rounded-xl">
          <h2 className="font-serif text-2xl font-normal text-foreground">Livro não encontrado</h2>
          <Link href="/library" className="text-sm font-bold text-primary mt-4 inline-block hover:underline">
            Voltar para a biblioteca
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto pb-16">
        <SettingsHeader bookId={bookId} onBack={s.handleCancel} />
        <SettingsForm settings={s} />

        <DeleteBookModal
          isOpen={s.isDeleteModalOpen}
          onClose={() => s.setIsDeleteModalOpen(false)}
          onConfirm={s.handleConfirmDelete}
          bookTitle={s.book.title}
          isDeleting={s.isDeleting}
        />
        <DiscardChangesModal
          isOpen={s.isDiscardModalOpen}
          onClose={() => s.setIsDiscardModalOpen(false)}
          onDiscard={s.handleConfirmDiscard}
        />
      </div>
    </AppShell>
  );
}
