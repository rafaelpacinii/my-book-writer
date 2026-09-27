import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import type { ImageAsset, ImportImageInput } from "@/types/image";
import type { Book } from "@/types/book";

function isTauriEnvironment(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__)
  );
}

const STORAGE_KEY = "my_book_writer_book_covers";
const BOOKS_STORAGE_KEY = "my_book_writer_books";

function getStoredCovers(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

function saveStoredCovers(covers: Record<string, string>): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(covers));
  }
}

function updateBrowserBookCoverAssetId(bookId: string, assetId: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(BOOKS_STORAGE_KEY);
    if (!stored) return;
    const books = JSON.parse(stored) as Book[];
    const idx = books.findIndex((b) => b.id === bookId);
    if (idx !== -1) {
      books[idx].card_image_asset_id = assetId;
      books[idx].updated_at = new Date().toISOString();
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
    }
  } catch {
    // ignore
  }
}

export async function importImageAsset(input: ImportImageInput): Promise<ImageAsset> {
  if (!isTauriEnvironment()) {
    const id = `asset-${Date.now()}`;
    const asset: ImageAsset = {
      id,
      book_id: input.book_id,
      original_filename: input.original_filename,
      storage_key: `covers/${id}.png`,
      mime_type: input.mime_type,
      width_px: input.width_px,
      height_px: input.height_px,
      byte_size: input.data_base64.length,
      sha256: "mock-sha256",
      created_at: new Date().toISOString(),
    };
    const covers = getStoredCovers();
    covers[input.book_id] = input.data_base64;
    saveStoredCovers(covers);
    updateBrowserBookCoverAssetId(input.book_id, id);
    return asset;
  }
  return invoke<ImageAsset>("import_image_asset", { input });
}

export async function listImageAssets(bookId: string): Promise<ImageAsset[]> {
  if (!isTauriEnvironment()) {
    const covers = getStoredCovers();
    if (!covers[bookId]) return [];
    return [
      {
        id: `asset-${bookId}`,
        book_id: bookId,
        original_filename: "cover.png",
        storage_key: `covers/${bookId}.png`,
        mime_type: "image/png",
        width_px: 600,
        height_px: 400,
        byte_size: covers[bookId].length,
        sha256: "mock-sha256",
        created_at: new Date().toISOString(),
      },
    ];
  }
  return invoke<ImageAsset[]>("list_image_assets", { bookId });
}

export async function setBookCardImage(
  bookId: string,
  assetId?: string | null,
): Promise<void> {
  if (!isTauriEnvironment()) {
    const covers = getStoredCovers();
    if (!assetId) {
      delete covers[bookId];
      saveStoredCovers(covers);
      updateBrowserBookCoverAssetId(bookId, null);
    } else {
      updateBrowserBookCoverAssetId(bookId, assetId);
    }
    return;
  }
  return invoke<void>("set_book_card_image", {
    bookId,
    assetId: assetId ?? null,
  });
}

export async function getImageFilePath(storageKey: string): Promise<string> {
  if (!isTauriEnvironment()) return storageKey;
  return invoke<string>("get_image_file_path", { storageKey });
}

export function convertImagePathToSrc(filePath: string): string {
  if (!isTauriEnvironment()) return filePath;
  return convertFileSrc(filePath);
}

export async function loadBookCoverUrl(
  bookId: string,
  assetId?: string | null,
): Promise<string | null> {
  if (!isTauriEnvironment()) {
    if (assetId === null) return null;
    const covers = getStoredCovers();
    return covers[bookId] || null;
  }
  if (assetId === null) return null;
  try {
    const assets = await listImageAssets(bookId);
    if (!assets || assets.length === 0) return null;
    const asset = assetId ? assets.find((a) => a.id === assetId) || assets[0] : assets[0];
    if (!asset) return null;

    try {
      const dataUrl = await invoke<string>("read_image_data_url", {
        storageKey: asset.storage_key,
      });
      if (dataUrl) return dataUrl;
    } catch {
      // Fallback para conversão de caminho do arquivo caso comando falhe
    }

    const path = await getImageFilePath(asset.storage_key);
    return convertImagePathToSrc(path);
  } catch {
    return null;
  }
}

export async function saveBookCoverImage(
  bookId: string,
  dataUrl: string | null,
): Promise<string | null> {
  if (!isTauriEnvironment()) {
    const covers = getStoredCovers();
    if (!dataUrl) {
      delete covers[bookId];
      saveStoredCovers(covers);
      updateBrowserBookCoverAssetId(bookId, null);
      return null;
    }
    const assetId = `cover-${bookId}-${Date.now()}`;
    covers[bookId] = dataUrl;
    saveStoredCovers(covers);
    updateBrowserBookCoverAssetId(bookId, assetId);
    return assetId;
  }

  if (!dataUrl) {
    await setBookCardImage(bookId, null);
    return null;
  }

  if (!dataUrl.startsWith("data:")) return null;

  const mimeMatch = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/png";

  const asset = await importImageAsset({
    book_id: bookId,
    original_filename: "cover.png",
    mime_type: mimeType,
    width_px: 600,
    height_px: 400,
    data_base64: dataUrl,
  });

  await setBookCardImage(bookId, asset.id);
  return asset.id;
}
