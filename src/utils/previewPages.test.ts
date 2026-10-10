import { expect, test } from "vitest";
import { chapterStarts, clampPage, getChapterMarkers, locatePage, totalPages } from "./previewPages";

test("chapters start on a new page and empty chapters still take one page", () => {
  expect(chapterStarts([3, 0, 2])).toEqual([0, 3, 4]);
  expect(totalPages([3, 0, 2])).toBe(6);
});

test("global pages map to the right chapter and local page", () => {
  const counts = [3, 1, 2];
  expect(locatePage(counts, 1)).toEqual({ chapterIndex: 0, page: 1 });
  expect(locatePage(counts, 3)).toEqual({ chapterIndex: 0, page: 3 });
  expect(locatePage(counts, 4)).toEqual({ chapterIndex: 1, page: 1 });
  expect(locatePage(counts, 6)).toEqual({ chapterIndex: 2, page: 2 });
});

test("out of range pages are clamped to the book", () => {
  expect(clampPage(0, [2, 2])).toBe(1);
  expect(clampPage(99, [2, 2])).toBe(4);
  expect(locatePage([2, 2], 99)).toEqual({ chapterIndex: 1, page: 2 });
  expect(clampPage(5, [])).toBe(1);
});

test("getChapterMarkers generates accurate positions for the progress track", () => {
  const markers = getChapterMarkers([5, 5]);
  expect(markers).toEqual([
    { chapterIndex: 0, startPage: 1, percent: 0 },
    { chapterIndex: 1, startPage: 6, percent: (5 / 9) * 100 },
  ]);
  expect(getChapterMarkers([])).toEqual([]);
});
