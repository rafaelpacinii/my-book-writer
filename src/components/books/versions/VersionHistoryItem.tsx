import { Trash2 } from "lucide-react";
import { versionDate } from "@/utils/versionHistory";
import type { ChapterVersionSummary } from "@/types/chapterVersion";

interface Props {
  version: ChapterVersionSummary;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function VersionHistoryItem({ version, isSelected, onSelect, onDelete }: Props) {
  const date = versionDate(version.created_at).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });
  return (
    <div className={`relative rounded-lg border ${isSelected ? "border-primary bg-primary-soft" : "border-border bg-surface"}`}>
      <button type="button" onClick={onSelect} aria-pressed={isSelected}
        aria-label={`Abrir versão #${version.version_number}`}
        className="flex w-full flex-col gap-1.5 rounded-lg p-3 pr-10 text-left hover:bg-surface-hover"
      >
        <span className="text-xs font-bold text-foreground">Versão #{version.version_number}</span>
        {version.description && <span className="w-full truncate text-xs text-foreground">{version.description}</span>}
        <span className="text-[11px] text-muted">{date} · {version.word_count} palavras</span>
      </button>
      <button type="button" onClick={onDelete} aria-label={`Excluir versão #${version.version_number}`}
        className="absolute right-2 top-2 rounded-md p-1.5 text-muted hover:bg-danger-soft hover:text-danger"
      >
        <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
