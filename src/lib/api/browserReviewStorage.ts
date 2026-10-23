import type { ReviewComment, ReviewProgress } from "@/types/review";
import { versionDate } from "@/utils/versionHistory";

export const COMMENTS = "my_book_writer_review_comments";
export const PROGRESS = "my_book_writer_review_progress";

function read(key: string): unknown {
  try { return JSON.parse(localStorage.getItem(key) ?? (key === COMMENTS ? "[]" : "{}")); }
  catch { throw new Error("Não foi possível ler a revisão local. Seus dados foram preservados."); }
}

export function storedComments(): ReviewComment[] {
  const value = read(COMMENTS);
  if (!Array.isArray(value) || value.some((comment: unknown) => {
    if (!comment || typeof comment !== "object") return true;
    const c = comment as Partial<ReviewComment>;
    return typeof c.id !== "string" || typeof c.chapter_id !== "string" || typeof c.body !== "string"
      || typeof c.author_profile_id !== "string"
      || typeof c.original_excerpt !== "string" || !["open", "resolved"].includes(c.status ?? "")
      || !["attached", "removed"].includes(c.anchor_state ?? "") || !Number.isSafeInteger(c.anchor_revision)
      || c.anchor_revision! < 0 || !(c.anchor_json === null || typeof c.anchor_json === "string")
      || typeof c.created_at !== "string" || typeof c.updated_at !== "string"
      || !Number.isFinite(versionDate(c.created_at).getTime()) || !Number.isFinite(versionDate(c.updated_at).getTime())
      || (c.status === "resolved" ? typeof c.resolved_at !== "string" : c.resolved_at !== null);
  })) throw new Error("Os comentários locais estão inválidos. Seus dados foram preservados.");
  return value as ReviewComment[];
}

export function storedProgress(): Record<string, ReviewProgress> {
  const value = read(PROGRESS);
  if (!value || typeof value !== "object" || Array.isArray(value)
    || Object.entries(value).some(([key, progress]: [string, unknown]) => {
      if (!progress || typeof progress !== "object") return true;
      const p = progress as Partial<ReviewProgress>;
      return p.chapter_id !== key || typeof p.profile_id !== "string" || typeof p.needs_recheck !== "boolean"
        || !Number.isSafeInteger(p.reviewed_content_revision) || p.reviewed_content_revision! < 0
        || !Number.isSafeInteger(p.anchor_revision) || p.anchor_revision! < 0
        || !(p.anchor_json === null || typeof p.anchor_json === "string")
        || typeof p.marked_at !== "string" || typeof p.updated_at !== "string";
    })) throw new Error("O progresso local está inválido. Seus dados foram preservados.");
  return value as Record<string, ReviewProgress>;
}

/** Restore earlier writes if a later storage operation fails. */
export function commitReviewStorage(entries: Array<[string, string]>) {
  const previous = entries.map(([key]) => [key, localStorage.getItem(key)] as const);
  let written = 0;
  try {
    for (const [key, value] of entries) { localStorage.setItem(key, value); written++; }
  } catch (cause) {
    for (const [key, value] of previous.slice(0, written).reverse()) {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    }
    throw cause;
  }
}
