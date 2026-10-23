import { describe, expect, it } from "vitest";
import { makeReviewAnchor, parseReviewAnchor, reconcileReviewAnchor, resolveReviewAnchor } from "@/utils/reviewAnchors";
import { reviewState } from "@/utils/reviewState";
import type { ReviewProgress } from "@/types/review";

describe("review anchors and state", () => {
  it("keeps the selected occurrence and follows text inserted before it", () => {
    const text = "Primeiro: igual. Segundo: igual.";
    const start = text.lastIndexOf("igual");
    const anchor = makeReviewAnchor(text, start, start + 5);
    expect(resolveReviewAnchor(text, anchor)?.start).toBe(start);
    expect(resolveReviewAnchor("Inserção. " + text, anchor)?.start).toBe(start + 10);
  });
  it("never guesses an ambiguous legacy excerpt and preserves missing excerpts as detached", () => {
    expect(reconcileReviewAnchor("igual igual", "{}", "igual")).toBeNull();
    expect(reconcileReviewAnchor("único", "{}", "único")?.start).toBe(0);
    expect(reconcileReviewAnchor("removido", JSON.stringify(makeReviewAnchor("trecho", 0, 6)), "trecho")).toBeNull();
    expect(reconcileReviewAnchor("trecho", null, "trecho")).toBeNull();
  });
  it("uses DOM-compatible UTF-16 offsets and rejects invalid payloads", () => {
    const anchor = makeReviewAnchor("😀 início trecho fim", 10, 16);
    expect(anchor.quote).toBe("trecho");
    expect(parseReviewAnchor(JSON.stringify(anchor))).toEqual(anchor);
    expect(parseReviewAnchor(JSON.stringify({ ...anchor, start: -1 }))).toBeNull();
    expect(parseReviewAnchor("{bad")).toBeNull();
  });
  it("retains the exact occurrence in unchanged repetitive text and never splits emoji context", () => {
    const text = "😀".repeat(21) + "igual" + "😀".repeat(21);
    const anchor = makeReviewAnchor(text, 42, 47);
    expect(anchor.prefix).toBe("😀".repeat(20));
    expect(anchor.suffix).toBe("😀".repeat(20));
    const repeated = "abc ".repeat(100);
    const selected = makeReviewAnchor(repeated, 200, 203);
    expect(resolveReviewAnchor(repeated, selected)?.start).toBe(200);
    expect(resolveReviewAnchor("" + repeated.slice(0, 180), selected)).toBeNull();
  });
  it("distinguishes never reviewed, pending, current and outdated content", () => {
    const progress = { needs_recheck: false, reviewed_content_revision: 2 } as ReviewProgress;
    expect(reviewState(null, 2, 0)).toBe("unreviewed");
    expect(reviewState(null, 2, 1)).toBe("pending");
    expect(reviewState(progress, 2, 0)).toBe("reviewed");
    expect(reviewState(progress, 3, 0)).toBe("outdated");
    expect(reviewState(progress, 2, 0, true)).toBe("outdated");
    expect(reviewState({ ...progress, needs_recheck: true }, 2, 0)).toBe("pending");
  });
});
