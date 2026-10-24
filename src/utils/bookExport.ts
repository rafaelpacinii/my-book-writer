import type { ExportFormat, PdfExportInfo } from "@/types/export";

export function exportIssues(info: PdfExportInfo, format: ExportFormat) {
  return info.issues.filter((issue) => issue.formats.includes(format));
}

export function exportUnavailable(info: PdfExportInfo, format: ExportFormat): string | null {
  if (!info.desktop_available) return "A exportação está disponível no aplicativo desktop.";
  if (format === "pdf" && !info.available) return info.unavailable_reason ?? "O gerador de PDF não está disponível. Reinstale o aplicativo.";
  if (!info.chapter_count) return "Adicione pelo menos um capítulo antes de exportar.";
  return exportIssues(info, format)[0]?.message ?? null;
}

export function exportError(cause: unknown): string {
  const message = cause instanceof Error ? cause.message : typeof cause === "string" ? cause
    : cause && typeof cause === "object" && "message" in cause && typeof cause.message === "string" ? cause.message : "";
  return message.trim() || "Não foi possível exportar o livro. Tente novamente.";
}
