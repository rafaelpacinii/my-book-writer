import { describe, expect, it } from "vitest";
import { exportError, exportIssues, exportUnavailable } from "./bookExport";
import type { PdfExportInfo } from "@/types/export";

const info: PdfExportInfo = {
  title: "Livro", author: "Autora", format_name: "14 × 21 cm", font_name: "Inter",
  chapter_count: 2, available: true, unavailable_reason: null, desktop_available: true, issues: [],
};

describe("export availability and feedback", () => {
  it("requires the desktop for every format, but Chromium only for PDF", () => {
    for (const format of ["pdf", "epub", "docx"] as const) {
      expect(exportUnavailable({ ...info, desktop_available: false }, format)).toContain("desktop");
    }
    const missing = { ...info, available: false, unavailable_reason: "Chromium indisponível" };
    expect(exportUnavailable(missing, "pdf")).toBe("Chromium indisponível");
    expect(exportUnavailable(missing, "epub")).toBeNull();
    expect(exportUnavailable(missing, "docx")).toBeNull();
  });

  it("blocks the affected formats and preserves a precise chapter message", () => {
    const issue = { code: "chapter_content", chapter_id: "chapter-2", message: "O capítulo 2 “Desfecho” está vazio.", formats: ["pdf", "epub", "docx"] as const };
    const invalid = { ...info, issues: [{ ...issue, formats: [...issue.formats] }] };
    for (const format of issue.formats) expect(exportUnavailable(invalid, format)).toBe(issue.message);
    const layout = { ...invalid, issues: [{ ...issue, formats: ["pdf", "docx"] as const }] };
    expect(exportIssues({ ...layout, issues: layout.issues.map((item) => ({ ...item, formats: [...item.formats] })) }, "epub")).toEqual([]);
    expect(exportUnavailable({ ...info, chapter_count: 0 }, "pdf")).toContain("capítulo");
  });

  it("uses readable feedback for string, Error, typed and unknown rejections", () => {
    for (const cause of [new Error("Capítulo vazio"), "Capítulo vazio", { message: "Capítulo vazio" }]) {
      expect(exportError(cause)).toBe("Capítulo vazio");
    }
    for (const cause of [null, undefined, {}, 123, " "]) expect(exportError(cause)).toContain("Tente novamente");
  });
});
