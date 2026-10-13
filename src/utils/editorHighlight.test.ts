import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { highlightAndScrollToExcerpt } from "./editorHighlight";

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

  it("finds and highlights excerpt when DOM is available", () => {
    const scrollIntoViewMock = vi.fn();
    const mockElement = {
      textContent: "Era uma vez um castelo",
      children: [],
      scrollIntoView: scrollIntoViewMock,
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    };

    const mockContainer = {
      querySelectorAll: () => [mockElement],
    };

    (globalThis as unknown as { document: unknown }).document = {
      querySelector: (selector: string) =>
        selector === ".editor-content" ? mockContainer : null,
      createTreeWalker: () => ({
        nextNode: () => null,
      }),
    };

    try {
      const result = highlightAndScrollToExcerpt(
        "castelo",
        ".editor-content",
        1000,
      );
      expect(result).toBe(true);
      expect(scrollIntoViewMock).toHaveBeenCalled();
      expect(mockElement.classList.add).toHaveBeenCalled();

      vi.advanceTimersByTime(1000);
      expect(mockElement.classList.remove).toHaveBeenCalled();
    } finally {
      delete (globalThis as unknown as { document?: unknown }).document;
    }
  });
});

