import React from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  onClearFilters: () => void;
}

export function LibraryNoResults({ onClearFilters }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-surface rounded-xl border border-border shadow-xs">
      <h2 className="font-serif text-2xl sm:text-[26px] font-normal text-foreground">
        Nenhum livro encontrado.
      </h2>
      <p className="text-sm text-muted mt-2 max-w-sm">
        Tente outro termo de busca ou remova os filtros aplicados.
      </p>

      <div className="mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onClearFilters}
          className="!h-11 px-6 !text-[13px] !font-bold"
        >
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}
