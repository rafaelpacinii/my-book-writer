"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ChapterTypeSelector } from "../detail/ChapterTypeSelector";
import type { ChapterType } from "@/types/chapter";
import { getDefaultTitleForType } from "@/utils/chapterType";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, type: ChapterType, customName?: string) => Promise<void>;
}

export function QuickNewChapterModal({ isOpen, onClose, onCreate }: Props) {
  const [type, setType] = useState<ChapterType>("standard");
  const [title, setTitle] = useState("");
  const [customName, setCustomName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = type === "standard"
      ? title.trim()
      : type === "custom"
        ? customName.trim()
        : getDefaultTitleForType(type);
    if (!finalTitle) {
      setError(type === "custom" ? "Informe o nome do capítulo." : "Informe um título.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onCreate(finalTitle, type, type === "custom" ? customName.trim() : undefined);
      setTitle(""); setType("standard"); setCustomName(""); onClose();
    } catch { /* erro tratado pelo chamador */
      setError("Não foi possível criar o capítulo. Verifique o salvamento e tente novamente.");
    } finally { setIsSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo capítulo">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ChapterTypeSelector value={type} onChange={setType} />
        {type === "standard" && (
          <Input label="Título do capítulo" placeholder="Ex: O despertar da floresta" value={title} onChange={(e) => setTitle(e.target.value)} error={error ?? undefined} autoFocus />
        )}
        {type === "custom" && (
          <Input label="Nome do capítulo especial" placeholder="Ex: Interlúdio, Nota do Autor..." value={customName} onChange={(e) => setCustomName(e.target.value)} error={error ?? undefined} autoFocus />
        )}
        {type !== "standard" && type !== "custom" && (
          <p className="text-xs text-muted bg-surface-hover/50 p-2.5 rounded-lg border border-border">
            O capítulo será criado como <strong className="text-foreground">{getDefaultTitleForType(type)}</strong>.
          </p>
        )}
        {error && type !== "standard" && type !== "custom" && <p role="alert" className="text-sm text-danger">{error}</p>}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>Criar capítulo</Button>
        </div>
      </form>
    </Modal>
  );
}
