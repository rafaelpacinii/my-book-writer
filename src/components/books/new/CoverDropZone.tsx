"use client";

import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";

interface Props {
  onFileLoaded: (dataUrl: string) => void;
}

export function CoverDropZone({ onFileLoaded }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onFileLoaded(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center p-5 rounded-xl border border-dashed transition-colors cursor-pointer text-center group mt-1 ${isDragging ? "border-primary bg-primary-soft/30" : "border-border bg-surface hover:border-primary/60"}`}
    >
      <Upload className="w-5 h-5 text-primary mb-2 group-hover:scale-105 transition-transform" />
      <span className="text-xs font-bold text-foreground">
        {isDragging ? "Solte a imagem aqui" : "Arraste uma capa ou escolha um arquivo"}
      </span>
      <span className="text-[11px] text-muted mt-1">Opcional · PNG, JPG ou WebP · até 25 MiB</span>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
        className="hidden"
      />
    </div>
  );
}
