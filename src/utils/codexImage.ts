import { CodexError } from "@/lib/codex/errors";

export const CODEX_IMAGE_LIMIT = 10 * 1024 * 1024;
export async function decodeCodexUpload(data: string) {
  if (data.length > 14_000_000 || !/^data:image\/(png|jpeg|webp);base64,/.test(data)) {
    throw new CodexError("validation", "Escolha uma imagem PNG, JPEG ou WebP de até 10 MB.");
  }
  try {
    const raw = atob(data.slice(data.indexOf(",") + 1));
    if (!raw.length || raw.length > CODEX_IMAGE_LIMIT) throw new Error("size");
    const bytes = Uint8Array.from(raw, (char) => char.charCodeAt(0));
    const signature = raw.startsWith("\x89PNG\r\n\x1a\n") || raw.startsWith("\xff\xd8\xff")
      || (raw.startsWith("RIFF") && raw.slice(8, 12) === "WEBP");
    if (!signature) throw new Error("format");
    const image = new Image();
    image.src = data;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth > 8192 || image.naturalHeight > 8192) throw new Error("dimensions");
    const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
    return { width: image.naturalWidth, height: image.naturalHeight,
      sha256: [...hash].map((byte) => byte.toString(16).padStart(2, "0")).join("") };
  } catch { throw new CodexError("validation", "A imagem está inválida ou ultrapassa 8192 pixels."); }
}
export function readCodexFile(file: File): Promise<string> {
  if (file.size > CODEX_IMAGE_LIMIT) return Promise.reject(new CodexError("validation", "Use imagens de até 10 MB."));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Não foi possível ler a imagem."));
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(file);
  });
}
