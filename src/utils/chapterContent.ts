import { removeLegacyPageBreaks } from "@/utils/bookPagination";

export interface ChapterNode {
  type?: string;
  text?: string;
  content?: ChapterNode[];
  blocks?: ChapterNode[];
}

export interface ChapterDoc extends ChapterNode {
  type: string;
  text?: string;
  html?: string;
  word_count?: number;
}

function legacyNodeText(node: ChapterNode): string {
  if (typeof node.text === "string") return node.text;
  const children = node.content ?? node.blocks ?? [];
  const separator = children.some((child) => child.type !== "text" && !child.text) ? "\n\n" : "";
  return children.map(legacyNodeText).join(separator);
}

export function extractPlainText(htmlOrText: string): string {
  if (!htmlOrText) return "";
  if (!/<[a-z][\s\S]*>/i.test(htmlOrText)) return htmlOrText.trim();
  return htmlOrText
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

export function textToHtml(plain: string): string {
  if (!plain) return "<p><br></p>";
  if (/<[a-z][\s\S]*>/i.test(plain)) return plain;
  return plain
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function parseChapterText(contentJson: string | null | undefined): string {
  if (!contentJson) return "<p><br></p>";
  try {
    const parsed = JSON.parse(contentJson) as ChapterDoc;
    if (typeof parsed.html === "string" && parsed.html) {
      return removeLegacyPageBreaks(parsed.html);
    }
    if (typeof parsed.text === "string" && parsed.text) {
      return removeLegacyPageBreaks(textToHtml(parsed.text));
    }
    const nodes = parsed.content ?? parsed.blocks;
    if (Array.isArray(nodes)) {
      return textToHtml(nodes.map(legacyNodeText).join("\n\n"));
    }
    return "<p><br></p>";
  } catch {
    return removeLegacyPageBreaks(textToHtml(contentJson));
  }
}

export function countWords(content: string): number {
  const plain = extractPlainText(content);
  if (!plain) return 0;
  return plain.split(/\s+/).filter(Boolean).length;
}

export function countCharacters(content: string): number {
  return extractPlainText(content).length;
}

export function estimateReadingTime(words: number): string {
  if (words === 0) return "0 min de leitura";
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `~${minutes} min de leitura`;
}

export function serializeChapterText(content: string): string {
  const plain = extractPlainText(content);
  const doc: ChapterDoc = {
    type: "doc",
    html: content,
    text: plain,
    word_count: countWords(plain),
  };
  return JSON.stringify(doc);
}
