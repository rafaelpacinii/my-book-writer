"use client";

import type { ReactNode } from "react";
import { coverResource } from "@/lib/data/coverResources";
import { useResource } from "@/hooks/useResource";
import { LoadingRegion } from "@/components/ui/LoadingRegion";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { RotateCcw } from "lucide-react";

interface Props {
  bookId: string;
  assetId: string;
  title: string;
  fallback: ReactNode;
  compact?: boolean;
}

export function BookCoverImage({ bookId, assetId, title, fallback, compact }: Props) {
  const resource = coverResource(bookId, assetId);
  const cover = useResource(resource);
  return (
    <LoadingRegion
      isLoading={cover.isLoading}
      label="Carregando capa"
      className="absolute inset-0"
      skeleton={<Skeleton className="absolute inset-0 rounded-none" />}
    >
      {cover.data ? (
        <img
          src={cover.data.src}
          alt={`Capa de ${title}`}
          className="h-full w-full object-cover"
          onError={() => resource.fail("A imagem não pôde ser exibida.")}
        />
      ) : (
        <div className="relative h-full">
          <div role="img" aria-label={`Capa indisponível: ${title}`} className="h-full">{fallback}</div>
          <div className="absolute inset-x-2 bottom-2 z-20 flex flex-wrap items-center gap-2 rounded-lg bg-surface p-2">
            <span className={compact ? "sr-only" : "text-xs text-foreground"}>Capa indisponível</span>
            <Button type="button" variant="outline" aria-label="Recarregar capa"
              className={compact ? "!min-h-7 !p-1" : undefined}
              onClick={() => { void cover.refresh(); }}
            >
              {compact ? <RotateCcw className="h-3.5 w-3.5" /> : "Recarregar capa"}
            </Button>
          </div>
        </div>
      )}
    </LoadingRegion>
  );
}
