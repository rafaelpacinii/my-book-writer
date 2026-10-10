"use client";

import React, { useState } from "react";
import type { BookFrontMatter, SaveFrontMatterInput } from "@/types/frontMatter";
import { FrontMatterModalTabs, type FrontMatterTab } from "./FrontMatterModalTabs";
import { FrontMatterTabContent } from "./FrontMatterTabContent";
import { useFrontMatterForm } from "./useFrontMatterForm";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: BookFrontMatter | null;
  bookTitle: string;
  authorName: string;
  chapterCount: number;
  onSave: (input: SaveFrontMatterInput) => Promise<boolean>;
  isSaving: boolean;
}

export function FrontMatterModal({
  isOpen, onClose, data, bookTitle, authorName, chapterCount, onSave, isSaving,
}: Props) {
  const [activeTab, setActiveTab] = useState<FrontMatterTab>("half-title");
  const { form, update } = useFrontMatterForm(data, isOpen);

  if (!isOpen || !form) return null;

  const handleSave = async () => {
    const success = await onSave(form);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-foreground">Páginas Iniciais (Pré-textuais)</h3>
          <p className="text-xs text-muted mt-0.5">
            Personalize a falsa folha, folha de rosto, créditos, dedicatória e sumário da sua obra.
          </p>
        </div>

        <FrontMatterModalTabs activeTab={activeTab} onSelectTab={setActiveTab} />

        <div className="flex-1 overflow-y-auto py-5 pr-1 min-h-[300px]">
          <FrontMatterTabContent
            tab={activeTab} form={form} bookTitle={bookTitle} authorName={authorName} chapterCount={chapterCount} update={update}
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border mt-2">
          <button type="button" onClick={onClose} className="px-3.5 py-2 text-xs font-semibold text-muted hover:text-foreground cursor-pointer">
            Cancelar
          </button>
          <button
            type="button" disabled={isSaving} onClick={handleSave}
            className="px-4 py-2 text-xs bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
          >
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

