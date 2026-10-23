import { storeChapterWithReview } from "@/lib/api/browserReviews";
import { storedChapter } from "@/lib/api/browserChapterStorage";
export { storedChapter, storeChapter } from "@/lib/api/browserChapterStorage";
import type { Chapter } from "@/types/chapter";
import type { ChapterVersion } from "@/types/chapterVersion";
import { countWords, parseChapterText } from "@/utils/chapterContent";
import { needsAutomaticVersion, versionDate } from "@/utils/versionHistory";
import { uuidV7 } from "@/utils/uuidV7";

const VERSIONS = "my_book_writer_chapter_versions";
const CHAPTERS = "my_book_writer_chapters";
const COUNTERS = "my_book_writer_version_counters";

function read<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback)) as T; }
  catch { throw new Error("Não foi possível ler os dados locais do histórico. Seus dados foram preservados."); }
}

export function storedVersions(): ChapterVersion[] {
  const versions = read<ChapterVersion[]>(VERSIONS, []);
  if (!Array.isArray(versions) || versions.some((v) => !v || typeof v.id !== "string"
    || typeof v.chapter_id !== "string" || typeof v.title !== "string" || typeof v.content_json !== "string"
    || !Number.isSafeInteger(v.version_number) || v.version_number < 1
    || !Number.isFinite(v.word_count) || v.word_count < 0 || !Number.isFinite(versionDate(v.created_at).getTime()))) {
    throw new Error("O histórico local está inválido. Seus dados foram preservados.");
  }
  return versions;
}

export function storeVersions(versions: ChapterVersion[]): void {
  localStorage.setItem(VERSIONS, JSON.stringify(versions));
}

export function browserCreateVersion(chapter: Chapter, description?: string): ChapterVersion {
  const versions = storedVersions();
  const counters = read<Record<string, number>>(COUNTERS, {});
  if (!counters || typeof counters !== "object" || Array.isArray(counters)
    || Object.values(counters).some((number) => !Number.isSafeInteger(number) || number < 0)) {
    throw new Error("Não foi possível ler a numeração do histórico. Seus dados foram preservados.");
  }
  const next = Math.max(counters[chapter.id] ?? 0, ...versions.filter((v) => v.chapter_id === chapter.id).map((v) => v.version_number), 0) + 1;
  const version: ChapterVersion = {
    id: uuidV7(), chapter_id: chapter.id, version_number: next, title: chapter.title,
    content_json: chapter.content_json, description: description?.trim() || null,
    word_count: countWords(parseChapterText(chapter.content_json)), created_at: new Date().toISOString(),
  };
  localStorage.setItem(COUNTERS, JSON.stringify({ ...counters, [chapter.id]: next }));
  storeVersions([version, ...versions]);
  return version;
}

export function browserCheckpoint(chapter: Chapter): ChapterVersion | null {
  if (!chapter.track_changes_enabled) return null;
  const latest = storedVersions().filter((v) => v.chapter_id === chapter.id).sort((a, b) => b.version_number - a.version_number)[0];
  return !latest || needsAutomaticVersion(latest.content_json, chapter.content_json, Date.now() - versionDate(latest.created_at).getTime())
    ? browserCreateVersion(chapter, "Snapshot automático") : null;
}

export function browserRestore(chapterId: string, versionId: string, expectedRevision: number): Chapter {
  const current = storedChapter(chapterId);
  const version = storedVersions().find((v) => v.id === versionId && v.chapter_id === chapterId);
  if (!version) throw new Error("A versão não pertence ao capítulo selecionado ou não existe.");
  try {
    const document: unknown = JSON.parse(version.content_json);
    if (!document || typeof document !== "object" || !("text" in document && typeof document.text === "string"
      || "html" in document && typeof document.html === "string"
      || "content" in document && Array.isArray(document.content)
      || "blocks" in document && Array.isArray(document.blocks))) throw new Error("Invalid document");
  }
  catch { throw new Error("O conteúdo desta versão é inválido e não pode ser restaurado."); }
  if (current.content_revision !== expectedRevision) throw new Error("O capítulo mudou desde que o histórico foi aberto. Atualize antes de restaurar.");
  browserCreateVersion(current, `Antes de restaurar versão #${version.version_number}`);
  const restored = { ...current, content_json: version.content_json, content_revision: current.content_revision + 1, updated_at: new Date().toISOString() };
  storeChapterWithReview(restored, read<Chapter[]>(CHAPTERS, []));
  return restored;
}
