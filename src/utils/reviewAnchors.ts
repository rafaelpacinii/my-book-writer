import type { ReviewAnchor } from "@/types/review";

let lastDocument: { text: string; hash: string } | undefined;
function documentHash(text: string): string {
  if (lastDocument?.text === text) return lastDocument.hash;
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
  const result = (hash >>> 0).toString(16).padStart(8, "0");
  lastDocument = { text, hash: result };
  return result;
}

export function makeReviewAnchor(text: string, start: number, end: number): ReviewAnchor {
  let prefixStart = Math.max(0, start - 40);
  let suffixEnd = Math.min(text.length, end + 40);
  if (/[\uDC00-\uDFFF]/.test(text[prefixStart] ?? "")) prefixStart++;
  if (/[\uD800-\uDBFF]/.test(text[suffixEnd - 1] ?? "")) suffixEnd--;
  return { version: 1, start, end, quote: text.slice(start, end),
    prefix: text.slice(prefixStart, start), suffix: text.slice(end, suffixEnd), document_hash: documentHash(text) };
}

export function parseReviewAnchor(json: string | null | undefined): ReviewAnchor | null {
  if (!json) return null;
  try {
    const value: unknown = JSON.parse(json);
    if (!value || typeof value !== "object") return null;
    if (Object.keys(value).some((key) => !["version", "start", "end", "quote", "prefix", "suffix", "document_hash"].includes(key))) return null;
    const anchor = value as Partial<ReviewAnchor>;
    return anchor.version === 1 && Number.isSafeInteger(anchor.start) && Number.isSafeInteger(anchor.end)
      && anchor.start! >= 0 && anchor.end! > anchor.start! && typeof anchor.quote === "string"
      && anchor.end! - anchor.start! === anchor.quote.length && typeof anchor.prefix === "string"
      && typeof anchor.suffix === "string" && anchor.prefix.length <= 40 && anchor.suffix.length <= 40
      && (anchor.document_hash === undefined || typeof anchor.document_hash === "string" && /^[0-9a-f]{8}$/.test(anchor.document_hash))
      ? anchor as ReviewAnchor : null;
  } catch { return null; }
}

export function resolveReviewAnchor(text: string, anchor: ReviewAnchor): ReviewAnchor | null {
  if (anchor.document_hash === documentHash(text) && text.slice(anchor.start, anchor.end) === anchor.quote) {
    return makeReviewAnchor(text, anchor.start, anchor.end);
  }
  const matches: Array<{ start: number; score: number }> = [];
  let start = text.indexOf(anchor.quote);
  while (start !== -1) {
    const prefix = text.slice(Math.max(0, start - anchor.prefix.length), start);
    const suffix = text.slice(start + anchor.quote.length, start + anchor.quote.length + anchor.suffix.length);
    let score = 0;
    for (let i = 1; i <= Math.min(prefix.length, anchor.prefix.length); i++) {
      if (prefix.at(-i) !== anchor.prefix.at(-i)) break;
      score++;
    }
    for (let i = 0; i < Math.min(suffix.length, anchor.suffix.length); i++) {
      if (suffix[i] !== anchor.suffix[i]) break;
      score++;
    }
    matches.push({ start, score });
    start = text.indexOf(anchor.quote, start + 1);
  }
  matches.sort((a, b) => b.score - a.score);
  const best = matches[0];
  if (!best || matches[1]?.score === best.score) return null;
  return makeReviewAnchor(text, best.start, best.start + anchor.quote.length);
}

/** Old annotations are linked only when their excerpt is unambiguous. */
export function reconcileReviewAnchor(text: string, json: string | null, quote: string): ReviewAnchor | null {
  if (!json) return null;
  const anchor = parseReviewAnchor(json);
  if (anchor) return resolveReviewAnchor(text, anchor);
  if (quote === "Capítulo") return null;
  const start = text.indexOf(quote);
  return quote && start !== -1 && text.indexOf(quote, start + 1) === -1
    ? makeReviewAnchor(text, start, start + quote.length) : null;
}
