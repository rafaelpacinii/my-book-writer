import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { highlightAndScrollToExcerpt } from "@/lib/editor/reviewHighlight";

describe("highlightAndScrollToExcerpt", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns false when document is undefined or excerpt is invalid or 'Capítulo'", () => {
    expect(highlightAndScrollToExcerpt("")).toBe(false);
    expect(highlightAndScrollToExcerpt("   ")).toBe(false);
    expect(highlightAndScrollToExcerpt("Capítulo")).toBe(false);
    expect(highlightAndScrollToExcerpt("Texto qualquer")).toBe(false);
  });

});
