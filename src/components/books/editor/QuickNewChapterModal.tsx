"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string) => Promise<void>;
}

export function QuickNewChapterModal({ isOpen, onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Informe um título para o capítulo.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onCreate(trimmed);
      setTitle("");
      onClose();
    } catch {
      // erro tratado pelo chamador
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo capítulo">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Título do capítulo"
          placeholder="Ex: Prólogo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={error ?? undefined}
          autoFocus
        />
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Criar capítulo
          </Button>
        </div>
      </form>
    </Modal>
  );
}
