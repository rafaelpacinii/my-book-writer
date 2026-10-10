import { describe, expect, it } from "vitest";
import {
  formatChapterBadge,
  formatChapterHeadingLabel,
  getChapterTypeLabel,
  getDefaultTitleForType,
} from "./chapterType";

describe("chapterType utilities", () => {
  it("returns default title for standard, custom, and fixed types", () => {
    expect(getDefaultTitleForType("standard")).toBe("");
    expect(getDefaultTitleForType("prologue")).toBe("Prólogo");
    expect(getDefaultTitleForType("preface")).toBe("Prefácio");
    expect(getDefaultTitleForType("custom", "Interlúdio")).toBe("Interlúdio");
    expect(getDefaultTitleForType("custom")).toBe("");
  });

  it("formats chapter badge correctly", () => {
    expect(formatChapterBadge({ chapter_type: "standard" }, 0, 0)).toEqual({
      badge: "01",
      isStandard: true,
    });
    expect(formatChapterBadge({ chapter_type: "prologue" }, 0, 0)).toEqual({
      badge: "",
      isStandard: false,
    });
    expect(formatChapterBadge({ chapter_type: "custom", custom_type_name: "Nota" }, 0, 0)).toEqual({
      badge: "",
      isStandard: false,
    });
  });

  it("formats chapter heading label", () => {
    expect(formatChapterHeadingLabel({ chapter_type: "standard" }, 0)).toBe("Capítulo 01");
    expect(formatChapterHeadingLabel({ chapter_type: "standard" }, 4)).toBe("Capítulo 05");
    expect(formatChapterHeadingLabel({ chapter_type: "prologue" }, 0)).toBe("");
    expect(formatChapterHeadingLabel({ chapter_type: "custom", custom_type_name: "Interlúdio" }, 0)).toBe("");
  });

  it("resolves readable label", () => {
    expect(getChapterTypeLabel("standard")).toBe("Capítulo Regular");
    expect(getChapterTypeLabel("prologue")).toBe("Prólogo");
    expect(getChapterTypeLabel("custom", "Nota do Autor")).toBe("Nota do Autor");
  });
});

