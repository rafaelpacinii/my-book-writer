import React from "react";
import { Maximize2, Minimize2, Trash2 } from "lucide-react";
import { EditorSaveIndicator } from "./EditorSaveIndicator";
import { EditorExportButton } from "./EditorExportButton";
import type { SaveStatus } from "./useChapterEditor";

interface Props {
  saveStatus: SaveStatus;
  isFocusMode: boolean;
  onToggleFocus: () => void;
  onSave: () => void;
  onDeleteClick: () => void;
  onExport: () => void;
  isOpeningExport: boolean;
}

export function EditorHeaderActions({
  saveStatus,
  isFocusMode,
  onToggleFocus,
  onDeleteClick,
  onExport,
  isOpeningExport,
}: Props) {
  return (
    <div className="flex items-center gap-3">
      <EditorSaveIndicator status={saveStatus} />
      <EditorExportButton onExport={onExport} isOpeningExport={isOpeningExport} />

      <button
        type="button"
        onClick={onDeleteClick}
        className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
        title="Excluir capítulo"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onToggleFocus}
        className="h-11 px-5 rounded-lg border border-control-border bg-surface hover:bg-surface-hover text-[13px] font-bold text-foreground transition-colors cursor-pointer flex items-center gap-2"
        title={isFocusMode ? "Sair do modo foco" : "Modo foco"}
      >
        {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        <span>{isFocusMode ? "Sair do foco" : "Modo foco"}</span>
      </button>
    </div>
  );
}
