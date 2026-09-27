"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { BookCoverArtwork } from "@/components/library/BookCoverArtwork";
import { CoverDropZone } from "./CoverDropZone";

interface Props {
  coverUrl?: string | null;
  onCoverChange?: (dataUrl: string | null) => void;
}

export function CoverPreview({ coverUrl, onCoverChange }: Props) {
  const [internalUrl, setInternalUrl] = useState<string | null>(coverUrl ?? null);
  const activeUrl = coverUrl !== undefined ? coverUrl : internalUrl;

  const handleLoaded = (dataUrl: string) => {
    setInternalUrl(dataUrl);
    onCoverChange?.(dataUrl);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalUrl(null);
    onCoverChange?.(null);
  };

  return (
    <div className="flex flex-col gap-3 select-none w-full">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold tracking-wider text-muted uppercase">Capa do livro</p>
        {activeUrl && (
          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex items-center gap-1 text-xs text-danger font-bold hover:underline cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Remover imagem</span>
          </button>
        )}
      </div>

      <div className="w-full h-48 rounded-xl overflow-hidden border border-border bg-surface relative">
        {activeUrl ? (
          <img src={activeUrl} alt="Capa do livro" className="w-full h-full object-cover" />
        ) : (
          <BookCoverArtwork className="w-full h-full" />
        )}
      </div>

      <div>
        <p className="text-[13px] font-bold text-foreground">
          {activeUrl ? "Capa personalizada ativa." : "Sua capa geométrica já está pronta."}
        </p>
        <p className="text-xs text-muted mt-0.5">
          {activeUrl ? "Você pode trocar a imagem ou removê-la para voltar à capa geométrica." : "Você pode personalizar quando quiser."}
        </p>
      </div>

      <CoverDropZone onFileLoaded={handleLoaded} />
    </div>
  );
}
