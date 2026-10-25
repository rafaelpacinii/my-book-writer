"use client";

import { ImageOff } from "lucide-react";
import { useResource } from "@/hooks/useResource";
import { codexImageResource } from "@/lib/data/codexImageResources";
import { Skeleton } from "@/components/ui/Skeleton";
import type { CodexScopeInput } from "@/types/codex";

export function CodexImageView({ scope, entity, image, alt, retry = false, contain = false }: {
  scope: CodexScopeInput; entity: string; image: string; alt: string; retry?: boolean; contain?: boolean;
}) {
  const resource = codexImageResource(scope, entity, image);
  const data = useResource(resource);
  if (data.isLoading) return <Skeleton className="h-full min-h-12 w-full" aria-label="Carregando imagem" />;
  if (data.error || !data.data) return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-2 text-center text-xs text-muted">
      <ImageOff size={22} aria-hidden="true" /><span>Imagem indisponível</span>
      {retry && <button type="button" className="underline" onClick={() => void data.refresh()}>Tentar carregar imagem novamente</button>}
    </div>
  );
  return <img src={data.data} alt={alt} className={`h-full w-full ${contain ? "object-contain" : "object-cover"}`}
    onError={() => resource.fail("Não foi possível abrir a imagem.")} />;
}
