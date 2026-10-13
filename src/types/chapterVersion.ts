export interface ChapterVersionSummary {
  id: string;
  chapter_id: string;
  version_number: number;
  title: string;
  description?: string | null;
  word_count: number;
  created_at: string;
}

export interface ChapterVersion extends ChapterVersionSummary {
  content_json: string;
}

export type DiffChangeType = "added" | "removed" | "unchanged";

export interface DiffPart {
  type: DiffChangeType;
  value: string;
}

