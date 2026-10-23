import { parseChapterText } from "@/utils/chapterContent";

export function chapterReviewText(json: string): string {
  const html = parseChapterText(json);
  if (typeof document !== "undefined") {
    const template = document.createElement("template");
    template.innerHTML = html;
    return template.content.textContent ?? "";
  }
  // Browser unit tests have no DOM; native HTML parsing is owned by Rust.
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "\u00a0").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
}
