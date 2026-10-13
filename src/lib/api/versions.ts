import { invoke } from "@tauri-apps/api/core";
import type { Chapter } from "@/types/chapter";
import type { ChapterVersion, ChapterVersionSummary } from "@/types/chapterVersion";

function isTauriEnvironment(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__)
  );
}

const VERSIONS_STORAGE_KEY = "my_book_writer_chapter_versions";

function getStoredVersions(): ChapterVersion[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(VERSIONS_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveStoredVersions(versions: ChapterVersion[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(versions));
}

export async function createChapterVersion(
  chapterId: string,
  description?: string,
): Promise<ChapterVersion> {
  if (!isTauriEnvironment()) {
    const list = getStoredVersions();
    const chapterVersions = list.filter((v) => v.chapter_id === chapterId);
    const nextNum = chapterVersions.length > 0
      ? Math.max(...chapterVersions.map((v) => v.version_number)) + 1
      : 1;

    const newVer: ChapterVersion = {
      id: `ver-${Date.now()}`,
      chapter_id: chapterId,
      version_number: nextNum,
      title: "Versão do Capítulo",
      content_json: "{}",
      description: description || null,
      word_count: 0,
      created_at: new Date().toISOString(),
    };
    list.unshift(newVer);
    saveStoredVersions(list);
    return newVer;
  }

  return invoke<ChapterVersion>("create_chapter_version", {
    chapterId,
    description: description || null,
  });
}

export async function listChapterVersions(chapterId: string): Promise<ChapterVersionSummary[]> {
  if (!isTauriEnvironment()) {
    return getStoredVersions()
      .filter((v) => v.chapter_id === chapterId)
      .map(({ content_json, ...rest }) => rest);
  }
  return invoke<ChapterVersionSummary[]>("list_chapter_versions", { chapterId });
}

export async function getChapterVersion(versionId: string): Promise<ChapterVersion | null> {
  if (!isTauriEnvironment()) {
    return getStoredVersions().find((v) => v.id === versionId) || null;
  }
  return invoke<ChapterVersion | null>("get_chapter_version", { versionId });
}

export async function restoreChapterVersion(chapterId: string, versionId: string): Promise<Chapter> {
  if (!isTauriEnvironment()) {
    throw new Error("Restauração simulada somente no navegador");
  }
  return invoke<Chapter>("restore_chapter_version", { chapterId, versionId });
}

export async function deleteChapterVersion(versionId: string): Promise<boolean> {
  if (!isTauriEnvironment()) {
    const list = getStoredVersions().filter((v) => v.id !== versionId);
    saveStoredVersions(list);
    return true;
  }
  return invoke<boolean>("delete_chapter_version", { versionId });
}

export async function setChapterTrackChanges(chapterId: string, enabled: boolean): Promise<Chapter> {
  if (!isTauriEnvironment()) {
    if (enabled) {
      const list = getStoredVersions().filter((v) => v.chapter_id === chapterId);
      if (list.length === 0) {
        await createChapterVersion(chapterId, "Início do rastreamento");
      }
    }
    return {
      id: chapterId,
      book_id: "book-1",
      title: "Capítulo",
      position: 1,
      chapter_type: "standard",
      custom_type_name: null,
      content_json: "{}",
      content_schema_version: 1,
      content_revision: 1,
      track_changes_enabled: enabled,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };
  }
  return invoke<Chapter>("set_chapter_track_changes", { chapterId, enabled });
}
