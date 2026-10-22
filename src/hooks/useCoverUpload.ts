"use client";

import { useId, useState, type DragEvent } from "react";

export function useCoverUpload(onFileLoaded: (dataUrl: string) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const inputId = useId();
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 25 * 1024 * 1024) {
      setError("Escolha PNG, JPG ou WebP de até 25 MiB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onerror = () => setError("Não foi possível ler o arquivo. Tente novamente.");
    reader.onload = () => {
      if (typeof reader.result === "string") onFileLoaded(reader.result);
      else setError("Não foi possível ler o arquivo. Tente novamente.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return { inputId, isDragging, setIsDragging, error, processFile, handleDrop };
}
