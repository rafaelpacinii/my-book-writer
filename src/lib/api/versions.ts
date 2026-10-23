import { invoke } from "@tauri-apps/api/core";
import type { Chapter } from "@/types/chapter";
import type { ChapterVersion, ChapterVersionSummary } from "@/types/chapterVersion";
import { browserCheckpoint, browserCreateVersion, browserRestore, storedChapter, storedVersions, storeChapter, storeVersions } from "@/lib/api/browserHistory";
import { publishDataChange } from "@/lib/data/changes";

function isTauriEnvironment(): boolean {
  return typeof window !== "undefined" && Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}

export async function createChapterVersion(chapterId: string, description?: string): Promise<ChapterVersion> {
  if (!isTauriEnvironment()) return browserCreateVersion(storedChapter(chapterId), description);
  return invoke<ChapterVersion>("create_chapter_version", { chapterId, description: description?.trim() || null });
}

export async function listChapterVersions(chapterId: string): Promise<ChapterVersionSummary[]> {
  if (!isTauriEnvironment()) return storedVersions().filter((v) => v.chapter_id === chapterId)
    .sort((a, b) => b.version_number - a.version_number).map(({ content_json, ...summary }) => summary);
  return invoke<ChapterVersionSummary[]>("list_chapter_versions", { chapterId });
}

export async function getChapterVersion(versionId: string): Promise<ChapterVersion | null> {
  if (!isTauriEnvironment()) return storedVersions().find((v) => v.id === versionId) ?? null;
  return invoke<ChapterVersion | null>("get_chapter_version", { versionId });
}

export async function restoreChapterVersion(chapterId: string, versionId: string, expectedRevision: number): Promise<Chapter> {
  const chapter = isTauriEnvironment()
    ? await invoke<Chapter>("restore_chapter_version", { chapterId, versionId, expectedRevision })
    : browserRestore(chapterId, versionId, expectedRevision);
  publishDataChange("books");
  return chapter;
}

export async function deleteChapterVersion(versionId: string): Promise<boolean> {
  if (!isTauriEnvironment()) {
    const versions = storedVersions();
    const remaining = versions.filter((v) => v.id !== versionId);
    storeVersions(remaining);
    return remaining.length !== versions.length;
  }
  return invoke<boolean>("delete_chapter_version", { versionId });
}

export async function setChapterTrackChanges(chapterId: string, enabled: boolean): Promise<Chapter> {
  if (!isTauriEnvironment()) {
    const chapter = { ...storedChapter(chapterId), track_changes_enabled: enabled };
    const latest = storedVersions().filter((v) => v.chapter_id === chapterId).sort((a, b) => b.version_number - a.version_number)[0];
    if (enabled && latest?.content_json !== chapter.content_json) browserCreateVersion(chapter, "Início do rastreamento");
    storeChapter(chapter);
    return chapter;
  }
  return invoke<Chapter>("set_chapter_track_changes", { chapterId, enabled });
}

export async function checkpointChapterHistory(chapterId: string): Promise<ChapterVersion | null> {
  if (!isTauriEnvironment()) return browserCheckpoint(storedChapter(chapterId));
  return invoke<ChapterVersion | null>("checkpoint_chapter_history", { chapterId });
}
