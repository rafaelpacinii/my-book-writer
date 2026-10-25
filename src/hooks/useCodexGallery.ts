"use client";

import { useRef, useState } from "react";
import { importCodexImage, updateCodexImage, deleteCodexImage } from "@/lib/api/codexGallery";
import { readCodexFile } from "@/utils/codexImage";
import type { CodexScopeInput, CodexSheet } from "@/types/codex";

export function useCodexGallery(scope: CodexScopeInput, sheet: CodexSheet) {
  const [selection, setSelection] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const locked = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const current = sheet.images.find((image) => image.id === selection)
    ?? sheet.images.find((image) => image.is_primary) ?? sheet.images[0];
  async function run(action: () => Promise<void>) {
    if (locked.current) return;
    locked.current = true; setBusy(true); setError(null);
    try { await action(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Não foi possível alterar a galeria."); }
    finally { locked.current = false; setBusy(false); }
  }
  const upload = (files: FileList | null) => {
    const selected = Array.from(files ?? []);
    if (!selected.length) return;
    void run(async () => {
      for (const file of selected) {
        const result = await importCodexImage(scope, sheet.entity.id, { original_filename: file.name, data_url: await readCodexFile(file) });
        setSelection(result.images.at(-1)?.id ?? null);
      }
      setAnnouncement(`${selected.length} imagem(ns) adicionada(s).`);
    });
    if (fileRef.current) fileRef.current.value = "";
  };
  const update = (id: string, caption: string, primary: boolean) => void run(async () => {
    await updateCodexImage(scope, sheet.entity.id, id, { caption, is_primary: primary });
    setAnnouncement(primary ? "Imagem principal atualizada." : "Legenda salva.");
  });
  const remove = () => void run(async () => {
    if (!removing) return;
    await deleteCodexImage(scope, sheet.entity.id, removing);
    setSelection(null); setRemoving(null); setAnnouncement("Imagem removida da galeria.");
  });
  return { current, busy, error, announcement, fileRef, upload, update, remove, removing,
    select: setSelection, askRemove: setRemoving, cancelRemove: () => { if (!locked.current) setRemoving(null); } };
}
export type CodexGallery = ReturnType<typeof useCodexGallery>;
