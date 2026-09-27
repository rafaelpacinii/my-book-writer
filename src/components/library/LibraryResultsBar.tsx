import React from "react";
import { RotateCcw } from "lucide-react";

interface Props {
  isFiltered: boolean;
  totalResults: number;
  onClearFilters: () => void;
}

export function LibraryResultsBar({ isFiltered, totalResults, onClearFilters }: Props) {
  if (!isFiltered) {
    return (
      <div className="mb-4">
        <p className="text-[11px] font-bold text-muted uppercase tracking-wider">
          Seus livros
        </p>
      </div>
    );
  }

  const resultsLabel = `${totalResults} ${totalResults === 1 ? "resultado" : "resultados"}`;

  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <p className="text-xs text-muted font-medium">
        {resultsLabel}
      </p>

      <button
        type="button"
        onClick={onClearFilters}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Limpar filtros</span>
      </button>
    </div>
  );
}
