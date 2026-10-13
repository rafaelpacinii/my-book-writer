import React, { useMemo } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { DiffView } from "./DiffView";
import { computeWordDiff } from "@/utils/textDiff";
import { extractPlainText, parseChapterText } from "@/utils/chapterContent";
import type { ChapterVersion } from "@/types/chapterVersion";

interface Props {
  version: ChapterVersion;
  currentContentHtml: string;
  onClose: () => void;
  onRestore: () => void;
}

export function VersionDiffModal({ version, currentContentHtml, onClose, onRestore }: Props) {
  const diffParts = useMemo(() => {
    const historicalText = extractPlainText(parseChapterText(version.content_json));
    const currentText = extractPlainText(currentContentHtml);
    return computeWordDiff(historicalText, currentText);
  }, [version.content_json, currentContentHtml]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à lista</span>
        </button>
        <button
          type="button"
          onClick={onRestore}
          className="px-2.5 py-1 text-xs rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary-hover flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar versão #{version.version_number}</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs text-muted mb-2">
          Comparando versão #{version.version_number} com o texto atual no editor:
        </p>
        <DiffView diffParts={diffParts} />
      </div>
    </div>
  );
}

