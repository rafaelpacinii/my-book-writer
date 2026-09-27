"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ChapterSummary } from "@/types/chapter";

interface Props {
  chapter: ChapterSummary | null;
  onClose: () => void;
  onConfirm: (newTitle: string) => void;
}

export function RenameChapterModal({ chapter, onClose, onConfirm }: Props) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (chapter) setTitle(chapter.title);
  }, [chapter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onConfirm(title.trim());
  };

  return (
    <Modal
      isOpen={Boolean(chapter)}
      onClose={onClose}
      title="Renomear capítulo"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Título do capítulo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: O despertar da floresta"
          autoFocus
        />

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!title.trim()}>
            Salvar alteração
          </Button>
        </div>
      </form>
    </Modal>
  );
}
