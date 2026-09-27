import React from "react";
import { Plus } from "lucide-react";

interface Props {
  onClick: () => void;
}

export function NewChapterCard({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col justify-between p-6 sm:p-7 rounded-xl bg-primary-soft/40 border border-dashed border-primary/50 hover:bg-primary-soft/60 hover:border-primary transition-all text-left group cursor-pointer min-h-52 select-none"
    >
      <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-xs">
        <Plus className="w-5 h-5" strokeWidth={2.2} />
      </div>

      <div>
        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
          Novo capítulo
        </h3>
        <p className="text-sm text-muted mt-1">
          Dê espaço à próxima ideia.
        </p>
      </div>
    </button>
  );
}
