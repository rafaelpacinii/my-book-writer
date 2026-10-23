import { extractPlainText, parseChapterText } from "@/utils/chapterContent";

export function needsAutomaticVersion(before: string, after: string, elapsedMs: number): boolean {
  if (before === after) return false;
  if (elapsedMs >= 180_000) return true;
  const words = (json: string) => extractPlainText(parseChapterText(json)).split(/\s+/).filter(Boolean);
  const oldWords = words(before), newWords = words(after);
  let prefix = 0, suffix = 0;
  while (prefix < Math.min(oldWords.length, newWords.length) && oldWords[prefix] === newWords[prefix]) prefix++;
  while (suffix < Math.min(oldWords.length, newWords.length) - prefix
    && oldWords[oldWords.length - 1 - suffix] === newWords[newWords.length - 1 - suffix]) suffix++;
  return Math.max(oldWords.length, newWords.length) - prefix - suffix >= 30;
}

export function versionDate(value: string): Date {
  return new Date(/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(value) ? value.replace(" ", "T") + "Z" : value);
}

export function historyError(error: unknown): string {
  if (error instanceof Error && error.name === "QuotaExceededError") return "Não há espaço disponível para salvar o histórico. Libere espaço e tente novamente.";
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  if (message && !/sqlite|database|banco de dados|constraint/i.test(message)) return message;
  return "Não foi possível atualizar o histórico. Tente novamente.";
}
