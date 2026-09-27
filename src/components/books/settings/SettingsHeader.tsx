"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  bookId: string;
  onBack?: () => void;
}

export function SettingsHeader({ bookId, onBack }: Props) {
  return (
    <div className="mb-6 select-none">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-muted hover:text-foreground transition-colors cursor-pointer mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>
      ) : (
        <Link
          href={`/books/view?bookId=${encodeURIComponent(bookId)}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-muted hover:text-foreground transition-colors cursor-pointer mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>
      )}

      <h1 className="font-serif text-3xl lg:text-[32px] font-normal text-foreground tracking-tight">
        Configurações do livro
      </h1>
      <p className="text-base text-muted font-normal mt-1.5">
        Ajuste os detalhes e a apresentação da sua obra.
      </p>
    </div>
  );
}
