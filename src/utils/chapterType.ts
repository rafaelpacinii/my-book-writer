import type { ChapterSummary, ChapterType } from "@/types/chapter";

export interface ChapterTypeOption {
  type: ChapterType;
  label: string;
  category: "front" | "body" | "back";
}

export const CHAPTER_TYPE_OPTIONS: ChapterTypeOption[] = [
  { type: "standard", label: "Capítulo Regular", category: "body" },
  { type: "prologue", label: "Prólogo", category: "front" },
  { type: "preface", label: "Prefácio", category: "front" },
  { type: "introduction", label: "Introdução", category: "front" },
  { type: "epilogue", label: "Epílogo", category: "back" },
  { type: "afterword", label: "Posfácio", category: "back" },
  { type: "acknowledgments", label: "Agradecimentos", category: "back" },
  { type: "custom", label: "Personalizado...", category: "body" },
];

export function getChapterTypeLabel(
  type: ChapterType = "standard",
  customName?: string | null
): string {
  if (type === "custom") {
    return customName?.trim() || "Capítulo Especial";
  }
  const found = CHAPTER_TYPE_OPTIONS.find((opt) => opt.type === type);
  return found?.label || "Capítulo";
}

export function getDefaultTitleForType(
  type: ChapterType,
  customName?: string | null
): string {
  if (type === "standard") return "";
  if (type === "custom") return customName?.trim() || "";
  return getChapterTypeLabel(type);
}

export function formatChapterBadge(
  chapter: Pick<ChapterSummary, "chapter_type" | "custom_type_name">,
  _indexInAll: number,
  standardIndex: number
): { badge: string; isStandard: boolean } {
  const type = chapter.chapter_type || "standard";
  if (type === "standard") {
    return {
      badge: String(standardIndex + 1).padStart(2, "0"),
      isStandard: true,
    };
  }
  return {
    badge: "",
    isStandard: false,
  };
}

export function formatChapterHeadingLabel(
  chapter: Pick<ChapterSummary, "chapter_type" | "custom_type_name">,
  standardIndex: number
): string {
  const type = chapter.chapter_type || "standard";
  if (type === "standard") {
    return `Capítulo ${String(standardIndex + 1).padStart(2, "0")}`;
  }
  return "";
}
