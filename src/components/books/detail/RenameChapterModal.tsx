"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChapterTypeSelector } from "./ChapterTypeSelector";
import type { ChapterSummary, ChapterType } from "@/types/chapter";
import { getDefaultTitleForType } from "@/utils/chapterType";

interface Props {
  chapter: ChapterSummary | null;
  onClose: () => void;
  onConfirm: (newTitle: string, type: ChapterType, customName?: string) => void;
}

export function RenameChapterModal({ chapter, onClose, onConfirm }: Props) {
  const [type, setType] = useState<ChapterType>("standard");
  const [title, setTitle] = useState("");
  const [customName, setCustomName] = useState("");

  useEffect(() => {
    if (chapter) {
      const t = chapter.chapter_type || "standard";
      setType(t);
      setTitle(chapter.title);
      setCustomName(chapter.custom_type_name || (t === "custom" ? chapter.title : ""));
    }
  }, [chapter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = type === "standard"
      ? title.trim()
      : type === "custom"
        ? customName.trim()
        : getDefaultTitleForType(type);
    if (!finalTitle) return;
    onConfirm(finalTitle, type, type === "custom" ? customName.trim() : undefined);
  };

  const isInvalid = type === "standard" ? !title.trim() : type === "custom" ? !customName.trim() : false;

  return (
    <Modal isOpen={Boolean(chapter)} onClose={onClose} title="Editar capítulo">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ChapterTypeSelector value={type} onChange={setType} />
        {type === "standard" && (
          <Input label="Título do capítulo" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: O despertar da floresta" autoFocus />
        )}
        {type === "custom" && (
          <Input label="Nome do capítulo especial" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Ex: Interlúdio, Nota do Autor..." autoFocus />
        )}
        {type !== "standard" && type !== "custom" && (
          <p className="text-xs text-muted bg-surface-hover/50 p-2.5 rounded-lg border border-border">
            Título fixo: <strong className="text-foreground">{getDefaultTitleForType(type)}</strong>.
          </p>
        )}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border mt-1">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={isInvalid}>Salvar alteração</Button>
        </div>
      </form>
    </Modal>
  );
}
