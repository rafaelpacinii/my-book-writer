import type { ChapterVersion, ChapterVersionSummary } from "@/types/chapterVersion";

export interface VersionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  versions: ChapterVersionSummary[];
  selectedVersion: ChapterVersion | null;
  trackChanges: boolean;
  onToggleTrackChanges: (enabled: boolean) => void;
  onCreateSnapshot: (desc?: string) => Promise<void>;
  onSelectVersion: (versionId: string) => Promise<void>;
  onRestoreVersion: (versionId: string) => Promise<void>;
  onDeleteVersion: (versionId: string) => Promise<void>;
  isComparing: boolean;
  onCloseDiff: () => void;
  currentContentHtml: string;
}

export interface VersionCardProps {
  version: ChapterVersionSummary;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

