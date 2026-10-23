import type { ChapterVersionSummary } from "@/types/chapterVersion";

export interface VersionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  versions: ChapterVersionSummary[];
  trackChanges: boolean;
  onToggleTrackChanges: (enabled: boolean) => Promise<void>;
  onCreateSnapshot: (desc?: string) => Promise<void>;
  onDeleteVersion: (versionId: string) => Promise<void>;
  onBeforeNavigate: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  onRetry: () => Promise<void>;
  bookId?: string;
  chapterId?: string;
}

export interface VersionCardProps {
  version: ChapterVersionSummary;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

