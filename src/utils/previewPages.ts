export interface PageLocation {
  chapterIndex: number;
  page: number;
}

/** Zero-based global index of the first page of each chapter. */
export function chapterStarts(counts: number[]): number[] {
  let start = 0;
  return counts.map((count) => {
    const current = start;
    start += Math.max(1, count);
    return current;
  });
}

export function totalPages(counts: number[]): number {
  return counts.reduce((sum, count) => sum + Math.max(1, count), 0);
}

export function clampPage(globalPage: number, counts: number[]): number {
  return Math.max(1, Math.min(globalPage, Math.max(1, totalPages(counts))));
}

/** Maps a 1-based book page to its chapter and the 1-based page inside it. */
export function locatePage(counts: number[], globalPage: number): PageLocation {
  const starts = chapterStarts(counts);
  const target = clampPage(globalPage, counts) - 1;
  let chapterIndex = 0;
  starts.forEach((start, index) => {
    if (start <= target) chapterIndex = index;
  });
  return { chapterIndex, page: target - (starts[chapterIndex] ?? 0) + 1 };
}

export interface ChapterMarker {
  chapterIndex: number;
  startPage: number;
  percent: number;
}

export function getChapterMarkers(counts: number[]): ChapterMarker[] {
  const total = totalPages(counts);
  if (total <= 0) return [];
  const starts = chapterStarts(counts);
  const divisor = Math.max(1, total - 1);
  return starts.map((start, chapterIndex) => ({
    chapterIndex,
    startPage: start + 1,
    percent: Math.min(100, Math.max(0, (start / divisor) * 100)),
  }));
}

