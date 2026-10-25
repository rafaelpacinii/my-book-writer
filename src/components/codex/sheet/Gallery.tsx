import { ImagePlus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CodexImageView } from "@/components/codex/CodexImageView";
import { GalleryActions } from "@/components/codex/sheet/GalleryActions";
import { useCodexGallery } from "@/hooks/useCodexGallery";
import type { CodexScopeInput, CodexSheet } from "@/types/codex";

export function Gallery({ sheet, scope, archived }: { sheet: CodexSheet; scope: CodexScopeInput; archived: boolean }) {
  const gallery = useCodexGallery(scope, sheet);
  return (
    <section aria-label="Galeria da ficha" className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <h2 className="text-sm font-bold text-foreground">Galeria</h2><span className="text-xs text-muted">{sheet.images.length} / 64</span>
      </div>
      <div className="aspect-[4/5] w-full overflow-hidden bg-primary-soft">
        {gallery.current ? <CodexImageView scope={scope} entity={sheet.entity.id} image={gallery.current.id}
          alt={gallery.current.caption || `Imagem de ${sheet.entity.name}`} contain retry /> : (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-primary">
            <UserRound size={64} strokeWidth={1} aria-hidden="true" /><p className="text-sm">Adicione referências para dar vida à sua ficha.</p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 p-4">
        {sheet.images.length > 0 && <div role="group" aria-label="Miniaturas da galeria" className="grid grid-cols-4 gap-2">
          {sheet.images.map((image, index) => (
            <button key={image.id} type="button" aria-label={`Ver imagem ${index + 1}${image.is_primary ? " (principal)" : ""}`}
              aria-pressed={gallery.current?.id === image.id} onClick={() => gallery.select(image.id)} disabled={gallery.busy}
              className={`aspect-square overflow-hidden rounded-md border-2 ${gallery.current?.id === image.id ? "border-primary" : "border-transparent"}`}>
              <CodexImageView scope={scope} entity={sheet.entity.id} image={image.id} alt="" />
            </button>
          ))}
        </div>}
        {!archived && <>
          <input ref={gallery.fileRef} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden
            aria-label="Selecionar imagens da ficha" onChange={(event) => gallery.upload(event.target.files)} />
          <Button type="button" variant="outline" disabled={gallery.busy || sheet.images.length >= 64}
            onClick={() => gallery.fileRef.current?.click()}><ImagePlus size={16} aria-hidden="true" />Adicionar imagens</Button>
          <p className="text-xs text-muted">PNG, JPEG ou WebP · até 10 MB e 8192 pixels.</p>
          {gallery.current && <GalleryActions key={gallery.current.id} gallery={gallery} image={gallery.current} />}
        </>}
        {archived && gallery.current?.caption && <p className="break-words text-sm text-foreground">{gallery.current.caption}</p>}
        {gallery.error && !gallery.removing && <p role="alert" className="text-sm text-danger">{gallery.error}</p>}
        <p role="status" className="sr-only">{gallery.busy ? "Salvando galeria…" : gallery.announcement}</p>
      </div>
    </section>
  );
}
