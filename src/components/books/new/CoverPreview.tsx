"use client";

import { useCoverPreview } from "@/hooks/useCoverPreview";
import { DecodedImage } from "@/components/ui/DecodedImage";
import { X } from "lucide-react";
import { BookCoverArtwork } from "@/components/library/BookCoverArtwork";
import { CoverDropZone } from "@/components/books/new/CoverDropZone";

interface Props {
  coverUrl?: string | null;
  onCoverChange?: (dataUrl: string | null) => void;
}

export function CoverPreview({ coverUrl, onCoverChange }: Props) {
  const { activeUrl, handleLoaded, handleRemove } = useCoverPreview(coverUrl, onCoverChange);

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
          <DecodedImage key={activeUrl} src={activeUrl} alt="Capa do livro" />
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
