"use client";

import { useDecodedImage } from "@/hooks/useDecodedImage";
import { LoadingRegion } from "@/components/ui/LoadingRegion";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

export function DecodedImage({ src, alt }: { src: string; alt: string }) {
  const image = useDecodedImage(src);
  return (
    <LoadingRegion isLoading={image.isLoading} label="Preparando imagem" className="h-full" skeleton={<Skeleton className="h-48 w-full" />}>
      {image.data ? (
        <img src={image.data} alt={alt} className="h-full w-full object-cover" onError={() => image.fail("Imagem indisponível")} />
      ) : (
        <div role="alert" className="flex h-full flex-col items-center justify-center gap-3 p-4 text-sm text-danger">
          <p>Não foi possível abrir esta imagem.</p>
          <Button type="button" variant="outline" onClick={() => { void image.refresh(); }}>Tentar novamente</Button>
        </div>
      )}
    </LoadingRegion>
  );
}
