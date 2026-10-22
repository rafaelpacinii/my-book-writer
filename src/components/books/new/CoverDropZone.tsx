"use client";

import { useCoverUpload } from "@/hooks/useCoverUpload";
import { Upload } from "lucide-react";

interface Props {
  onFileLoaded: (dataUrl: string) => void;
}

export function CoverDropZone({ onFileLoaded }: Props) {
  const { inputId, isDragging, setIsDragging, error, processFile, handleDrop } = useCoverUpload(onFileLoaded);

  return (
    <label
      htmlFor={inputId}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center p-5 rounded-xl border border-dashed transition-colors focus-within:outline-2 focus-within:outline-primary cursor-pointer text-center group mt-1 ${isDragging ? "border-primary bg-primary-soft/30" : "border-border bg-surface hover:border-primary/60"}`}
    >
      <Upload className="w-5 h-5 text-primary mb-2 group-hover:scale-105 transition-transform" />
      <span className="text-xs font-bold text-foreground">
        {isDragging ? "Solte a imagem aqui" : "Arraste uma capa ou escolha um arquivo"}
      </span>
      <span className="text-[11px] text-muted mt-1">Opcional · PNG, JPG ou WebP · até 25 MiB</span>
      {error && <span role="alert" className="mt-2 text-xs text-danger">{error}</span>}
      <input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
        className="sr-only"
      />
    </label>
  );
}
