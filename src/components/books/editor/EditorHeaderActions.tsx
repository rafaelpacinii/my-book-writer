import React from "react";
import { Maximize2, Minimize2, Save, Trash2 } from "lucide-react";
import { EditorSaveIndicator } from "./EditorSaveIndicator";
import type { SaveStatus } from "./useChapterEditor";

interface Props {
  saveStatus: SaveStatus;
  isFocusMode: boolean;
  onToggleFocus: () => void;
  onSave: () => void;
  onDeleteClick: () => void;
}

export function EditorHeaderActions({
  saveStatus,
  isFocusMode,
  onToggleFocus,
  onSave,
  onDeleteClick,
}: Props) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <EditorSaveIndicator status={saveStatus} />
      <button
        type="button"
        onClick={onToggleFocus}
        className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
        title={isFocusMode ? "Sair do modo foco" : "Modo foco (tela cheia)"}
      >
        {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>
      <button
        type="button"
        onClick={onDeleteClick}
        className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
        title="Excluir capítulo"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saveStatus === "saving"}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
      >
        <Save className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Salvar</span>
      </button>
    </div>
  );
}
