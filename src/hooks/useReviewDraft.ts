"use client";

import { useState } from "react";
import type { ReviewAnchor } from "@/types/review";

interface Draft {
  body: string;
  anchor: ReviewAnchor | null;
  edits: Record<string, string>;
}
const empty: Draft = { body: "", anchor: null, edits: {} };

export function useReviewDraft(chapterId: string) {
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const draft = drafts[chapterId] ?? empty;
  const update = (change: Partial<Draft>) => {
    setDrafts((all) => ({ ...all, [chapterId]: { ...(all[chapterId] ?? empty), ...change } }));
  };
  const edit = (id: string, text: string | null) => {
    setDrafts((all) => {
      const current = all[chapterId] ?? empty;
      const edits = { ...current.edits };
      if (text === null) delete edits[id];
      else edits[id] = text;
      return { ...all, [chapterId]: { ...current, edits } };
    });
  };
  const clearSubmitted = (body: string) => {
    setDrafts((all) => {
      const current = all[chapterId] ?? empty;
      return current.body === body ? { ...all, [chapterId]: { ...current, body: "", anchor: null } } : all;
    });
  };
  return { draft, updateDraft: update, editDraft: edit, clearSubmitted };
}
