export interface ChapterDoc {
  type: string;
  text?: string;
  word_count?: number;
  content?: Array<{
    type?: string;
    text?: string;
    content?: Array<{ text?: string }>;
  }>;
}

export function parseChapterText(contentJson: string | null | undefined): string {
  if (!contentJson) return "";
  try {
    const parsed = JSON.parse(contentJson) as ChapterDoc;
    if (typeof parsed.text === "string") {
      return parsed.text;
    }
    if (Array.isArray(parsed.content)) {
      const parts: string[] = [];
      for (const node of parsed.content) {
        if (node.text) {
          parts.push(node.text);
        } else if (Array.isArray(node.content)) {
          const inner = node.content.map((c) => c.text || "").join("");
          if (inner) parts.push(inner);
        }
      }
      return parts.join("\n\n");
    }
    return "";
  } catch {
    return contentJson;
  }
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function countCharacters(text: string): number {
  return text.length;
}

export function estimateReadingTime(words: number): string {
  if (words === 0) return "0 min de leitura";
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `~${minutes} min de leitura`;
}

export function serializeChapterText(text: string): string {
  const doc: ChapterDoc = {
    type: "doc",
    text,
    word_count: countWords(text),
  };
  return JSON.stringify(doc);
}
