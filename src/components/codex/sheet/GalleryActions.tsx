import { useState } from "react";
import { Save, Star, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { CodexImage } from "@/types/codex";
import type { CodexGallery } from "@/hooks/useCodexGallery";

export function GalleryActions({ gallery, image }: { gallery: CodexGallery; image: CodexImage }) {
  const [caption, setCaption] = useState(image.caption ?? "");
  return (
    <>
      <form className="flex flex-col gap-3" onSubmit={(event) => { event.preventDefault(); gallery.update(image.id, caption, false); }}>
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1"><Input label="Legenda da imagem" value={caption} maxLength={1000} disabled={gallery.busy}
            onChange={(event) => setCaption(event.target.value)} /></div>
          <Button type="submit" variant="outline" aria-label="Salvar legenda" title="Salvar legenda" className="px-3" disabled={gallery.busy}>
            <Save aria-hidden="true" size={16} />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="min-w-0 flex-1 px-2" disabled={gallery.busy || image.is_primary}
            onClick={() => gallery.update(image.id, caption, true)}>
            <Star aria-hidden="true" size={16} />{image.is_primary ? "Imagem principal" : "Definir como principal"}
          </Button>
          <Button type="button" variant="ghost" aria-label="Remover imagem" title="Remover imagem" className="px-3"
            disabled={gallery.busy} onClick={() => gallery.askRemove(image.id)}><Trash2 aria-hidden="true" size={16} /></Button>
        </div>
      </form>
      <Modal isOpen={Boolean(gallery.removing)} onClose={gallery.cancelRemove} title="Remover imagem?">
        <p className="mb-5 text-sm text-foreground">Esta imagem deixará de aparecer na galeria da ficha.</p>
        {gallery.error && <p role="alert" className="mb-4 text-sm text-danger">{gallery.error}</p>}
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={gallery.cancelRemove} disabled={gallery.busy}>Cancelar</Button>
          <Button variant="danger" onClick={gallery.remove} isLoading={gallery.busy}>Confirmar remoção</Button>
        </div>
      </Modal>
    </>
  );
}
