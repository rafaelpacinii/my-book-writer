import { COMMENTS, PROGRESS, commitReviewStorage, storedComments, storedProgress } from "@/lib/api/browserReviewStorage";
import { storedChapter } from "@/lib/api/browserChapterStorage";
import { chapterReviewText } from "@/lib/editor/reviewText";
import { parseReviewAnchor, reconcileReviewAnchor } from "@/utils/reviewAnchors";
import { uuidV7 } from "@/utils/uuidV7";
import type { Chapter } from "@/types/chapter";
import type { CreateCommentInput, MarkProgressInput, ReviewComment, ReviewProgress } from "@/types/review";

function validateProfile(id: string) {
  const stored = localStorage.getItem("my_book_writer_profile");
  let profile: unknown;
  try { profile = stored ? JSON.parse(stored) : { id: "local-default-id" }; }
  catch { throw new Error("Não foi possível ler o perfil local."); }
  if (!profile || typeof profile !== "object" || !("id" in profile) || profile.id !== id) {
    throw new Error("Perfil não encontrado.");
  }
}

function revision(chapter: Chapter, expected: number) {
  if (chapter.content_revision !== expected) throw new Error("O capítulo mudou. Atualize a revisão antes de continuar.");
}

function reconcile(comment: ReviewComment, chapter: Chapter, text: string): ReviewComment {
  const anchor = reconcileReviewAnchor(text, comment.anchor_json, comment.original_excerpt);
  return { ...comment, anchor_json: anchor ? JSON.stringify(anchor) : null,
    anchor_state: anchor ? "attached" : "removed", anchor_revision: chapter.content_revision };
}

export function browserListComments(chapterId: string): ReviewComment[] {
  const chapter = storedChapter(chapterId);
  const comments = storedComments();
  const text = comments.some((comment) => comment.chapter_id === chapterId) ? chapterReviewText(chapter.content_json) : "";
  const updated = comments.map((comment) => comment.chapter_id === chapterId ? reconcile(comment, chapter, text) : comment);
  if (JSON.stringify(updated) !== JSON.stringify(comments)) localStorage.setItem(COMMENTS, JSON.stringify(updated));
  return updated.filter((comment) => comment.chapter_id === chapterId);
}

export function browserGetProgress(chapterId: string): ReviewProgress | null {
  const chapter = storedChapter(chapterId);
  const progress = storedProgress()[chapterId];
  if (!progress) return null;
  const pending = progress.needs_recheck || progress.reviewed_content_revision !== chapter.content_revision
    || storedComments().some((comment) => comment.chapter_id === chapterId && comment.status === "open");
  return { ...progress, needs_recheck: pending };
}

export function browserCreateComment(input: CreateCommentInput): ReviewComment {
  if (!input.body.trim()) throw new Error("O comentário não pode ser vazio");
  if (!input.original_excerpt.trim()) throw new Error("O trecho selecionado não pode ser vazio");
  const chapter = storedChapter(input.chapter_id);
  validateProfile(input.author_profile_id);
  revision(chapter, input.anchor_revision);
  if (input.anchor_json !== undefined && input.anchor_json !== null) {
    const anchor = parseReviewAnchor(input.anchor_json);
    const text = chapterReviewText(chapter.content_json);
    if (!anchor || anchor.quote !== input.original_excerpt.trim() || text.slice(anchor.start, anchor.end) !== anchor.quote) {
      throw new Error("O trecho selecionado mudou. Selecione-o novamente.");
    }
  }
  const now = new Date().toISOString();
  const comment: ReviewComment = { ...input, id: uuidV7(), body: input.body.trim(),
    original_excerpt: input.original_excerpt.trim(), anchor_json: input.anchor_json ?? null,
    anchor_state: input.anchor_json ? "attached" : "removed", status: "open", created_at: now, updated_at: now, resolved_at: null };
  saveComments([...storedComments(), comment], chapter.id, true);
  return comment;
}

function saveComments(comments: ReviewComment[], chapterId: string, invalidate: boolean) {
  const progress = storedProgress();
  if (invalidate && progress[chapterId]) progress[chapterId] = { ...progress[chapterId], needs_recheck: true, updated_at: new Date().toISOString() };
  commitReviewStorage([[COMMENTS, JSON.stringify(comments)], [PROGRESS, JSON.stringify(progress)]]);
}

export function browserChangeComment(id: string, action: "resolved" | "open" | "edit" | "delete", body = ""): ReviewComment {
  const comments = storedComments();
  const comment = comments.find((c) => c.id === id);
  if (!comment) throw new Error("Comentário não encontrado.");
  storedChapter(comment.chapter_id);
  if (action === "edit" && !body.trim()) throw new Error("O comentário não pode ser vazio");
  const now = new Date().toISOString();
  const updated = { ...comment, updated_at: now };
  if (action === "edit") updated.body = body.trim();
  else if (action !== "delete") {
    updated.status = action;
    updated.resolved_at = action === "resolved" ? now : null;
  }
  saveComments(comments.flatMap((c) => c.id !== id ? [c] : action === "delete" ? [] : [updated]), comment.chapter_id, action === "open");
  return updated;
}

export function browserMarkProgress(input: MarkProgressInput): ReviewProgress {
  const chapter = storedChapter(input.chapter_id);
  validateProfile(input.profile_id);
  revision(chapter, input.reviewed_content_revision);
  revision(chapter, input.anchor_revision);
  if (input.anchor_json !== undefined && input.anchor_json !== null) {
    try { JSON.parse(input.anchor_json); } catch { throw new Error("A conclusão da revisão é inválida."); }
  }
  if (!input.needs_recheck) {
    let anchor: unknown;
    try { anchor = JSON.parse(input.anchor_json ?? "null"); } catch { throw new Error("A conclusão da revisão é inválida."); }
    if (!anchor || typeof anchor !== "object" || !("completed" in anchor) || anchor.completed !== true) throw new Error("A conclusão da revisão é inválida.");
    if (storedComments().some((c) => c.chapter_id === chapter.id && c.status === "open")) throw new Error("Resolva os comentários abertos antes de concluir a revisão.");
  }
  const map = storedProgress();
  const now = new Date().toISOString();
  const progress = { ...input, anchor_json: input.anchor_json ?? null, marked_at: now, updated_at: now };
  localStorage.setItem(PROGRESS, JSON.stringify({ ...map, [chapter.id]: progress }));
  return progress;
}

/** Called by both normal saves and history restoration before committing the chapter. */
export function storeChapterWithReview(chapter: Chapter, chapters: Chapter[]) {
  const stored = storedComments();
  const text = stored.some((comment) => comment.chapter_id === chapter.id) ? chapterReviewText(chapter.content_json) : "";
  const comments = stored.map((comment) => comment.chapter_id === chapter.id ? reconcile(comment, chapter, text) : comment);
  const progress = storedProgress();
  if (progress[chapter.id]) progress[chapter.id] = { ...progress[chapter.id], needs_recheck: true, updated_at: new Date().toISOString() };
  commitReviewStorage([[COMMENTS, JSON.stringify(comments)], [PROGRESS, JSON.stringify(progress)],
    ["my_book_writer_chapters", JSON.stringify(chapters.map((c) => c.id === chapter.id ? chapter : c))]]);
}
