import type { ChapterVersion, ChapterVersionSummary } from "@/types/chapterVersion";
import type { IndexedDiffPart } from "@/utils/textDiff";

export type CompareBase = "current" | "previous";
export type DiffLayoutMode = "unified" | "split";

export interface VersionsPageState {
  bookId: string;
  chapterId: string;
  bookTitle: string;
  chapterTitle: string;
  currentContentHtml: string;
  versions: ChapterVersionSummary[];
  selectedVersion: ChapterVersion | null;
  previousVersion: ChapterVersion | null;
  compareBase: CompareBase;
  layoutMode: DiffLayoutMode;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
  createVersion: () => Promise<void>;
  diffResult: {
    parts: IndexedDiffPart[];
    totalChanges: number;
    additions: number;
    deletions: number;
  };
  activeChangeIndex: number;
  setCompareBase: (base: CompareBase) => void;
  setLayoutMode: (mode: DiffLayoutMode) => void;
  selectVersion: (versionId: string) => Promise<void>;
  nextChange: () => void;
  prevChange: () => void;
  restoreCurrentVersion: () => Promise<boolean>;
  deleteVersion: (versionId: string) => Promise<void>;
}

