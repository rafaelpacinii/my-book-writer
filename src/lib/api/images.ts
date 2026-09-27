import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import type { ImageAsset, ImportImageInput } from "@/types/image";

/**
 * Importa uma nova imagem (salva o arquivo em disco gerenciado e persiste metadados no SQLite).
 */
export async function importImageAsset(input: ImportImageInput): Promise<ImageAsset> {
  return invoke<ImageAsset>("import_image_asset", { input });
}

/**
 * Lista todas as imagens importadas associadas a um livro.
 */
export async function listImageAssets(bookId: string): Promise<ImageAsset[]> {
  return invoke<ImageAsset[]>("list_image_assets", { bookId });
}

/**
 * Define a imagem de capa/card do livro (ou remove a associação se assetId for nulo).
 */
export async function setBookCardImage(
  bookId: string,
  assetId?: string | null,
): Promise<void> {
  return invoke<void>("set_book_card_image", {
    bookId,
    assetId: assetId ?? null,
  });
}

/**
 * Obtém o caminho absoluto no sistema de arquivos para uma chave de armazenamento (`storage_key`).
 */
export async function getImageFilePath(storageKey: string): Promise<string> {
  return invoke<string>("get_image_file_path", { storageKey });
}

/**
 * Converte um caminho absoluto de arquivo local para uma URL que o webview do Tauri consegue carregar em tags <img>.
 */
export function convertImagePathToSrc(filePath: string): string {
  return convertFileSrc(filePath);
}
