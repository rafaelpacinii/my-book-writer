"use client";

import React, { useRef } from "react";
import { Upload } from "lucide-react";
import { ContinueArtwork } from "@/components/home/ContinueArtwork";

interface Props {
  onSelectImage?: (file: File) => void;
}

export function CoverPreview({ onSelectImage }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onSelectImage) onSelectImage(file);
  };

  return (
    <div className="flex flex-col gap-3 select-none">
      <p className="text-xs font-bold tracking-wider text-muted uppercase">
        Capa do livro
      </p>

      <div className="w-full h-44 rounded-xl overflow-hidden border border-border bg-surface">
        <ContinueArtwork />
      </div>

      <div className="mt-1">
        <p className="text-[13px] font-bold text-foreground">
          Sua capa geométrica já está pronta.
        </p>
        <p className="text-xs text-muted mt-0.5">
          Você pode personalizar quando quiser.
        </p>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center p-5 rounded-xl border border-dashed border-border bg-surface hover:border-primary/60 transition-colors cursor-pointer text-center group mt-1"
      >
        <Upload className="w-5 h-5 text-primary mb-2 group-hover:scale-105 transition-transform" />
        <span className="text-xs font-bold text-foreground">
          Arraste uma capa ou escolha um arquivo
        </span>
        <span className="text-[11px] text-muted mt-1">
          Opcional · PNG, JPG ou WebP · até 25 MiB
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
