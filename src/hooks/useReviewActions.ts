"use client";

import { useRef, useState } from "react";
import { createReviewComment, deleteReviewComment, markReviewProgress, reopenReviewComment,
  resolveReviewComment, updateReviewComment } from "@/lib/api/reviews";
import { getChapterById } from "@/lib/api/chapters";
import { getProfile } from "@/lib/api/profile";
import { chapterReviewText } from "@/lib/editor/reviewText";
import { resolveReviewAnchor } from "@/utils/reviewAnchors";
import { reviewError } from "@/utils/reviewState";
import type { useReviewDraft } from "@/hooks/useReviewDraft";

interface Options extends ReturnType<typeof useReviewDraft> {
  chapterId: string;
  reload: () => Promise<void>;
  saveNow?: () => Promise<boolean>;
  isReady: boolean;
}

export function useReviewActions(options: Options) {
  const { chapterId, reload, saveNow, draft, clearSubmitted, editDraft, isReady } = options;
  const scope = useRef(chapterId);
  scope.current = chapterId;
  const lock = useRef(false);
  const [isPending, setPending] = useState(false);
  const [failure, setFailure] = useState<{ chapterId: string; message: string } | null>(null);
  const run = async (operation: () => Promise<unknown>) => {
    if (lock.current) return false;
    lock.current = true;
    setPending(true);
    setFailure(null);
    try {
      await operation();
      if (scope.current === chapterId) await reload();
      return true;
    } catch (cause) {
      if (scope.current === chapterId) setFailure({ chapterId, message: reviewError(cause) });
      return false;
    } finally { lock.current = false; setPending(false); }
  };
  const savedChapter = async () => {
    if (!isReady) throw new Error("O capítulo está carregando. Aguarde para revisar.");
    if (saveNow && !await saveNow()) throw new Error("Não foi possível salvar o capítulo. Tente novamente antes de concluir ou comentar.");
    const chapter = await getChapterById(chapterId);
    if (!chapter) throw new Error("Capítulo não encontrado.");
    return chapter;
  };
  const addComment = () => run(async () => {
    const body = draft.body.trim();
    if (!body) throw new Error("O comentário não pode ser vazio");
    const chapter = await savedChapter();
    const anchor = draft.anchor ? resolveReviewAnchor(chapterReviewText(chapter.content_json), draft.anchor) : null;
    if (draft.anchor && !anchor) throw new Error("O trecho selecionado mudou. Selecione-o novamente.");
    const profile = await getProfile();
    await createReviewComment({ chapter_id: chapterId, author_profile_id: profile.id, body,
      original_excerpt: anchor?.quote ?? "Capítulo", anchor_json: anchor ? JSON.stringify(anchor) : null,
      anchor_revision: chapter.content_revision });
    clearSubmitted(draft.body);
  });
  const markProgress = (needsRecheck: boolean) => run(async () => {
    const chapter = await savedChapter();
    const profile = await getProfile();
    await markReviewProgress({ chapter_id: chapterId, profile_id: profile.id,
      anchor_revision: chapter.content_revision, reviewed_content_revision: chapter.content_revision,
      needs_recheck: needsRecheck, anchor_json: needsRecheck ? null : JSON.stringify({ completed: true }) });
  });
  return { isPending, actionError: failure?.chapterId === chapterId ? failure.message : null,
    clearError: () => setFailure(null), addComment, markProgress,
    resolveComment: (id: string) => run(() => resolveReviewComment(id)),
    reopenComment: (id: string) => run(() => reopenReviewComment(id)),
    editComment: (id: string, body: string) => run(async () => { await updateReviewComment(id, body); editDraft(id, null); }),
    deleteComment: (id: string) => run(() => deleteReviewComment(id)) };
}
