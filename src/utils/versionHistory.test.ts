import { describe, expect, it } from "vitest";
import { extractPlainText, parseChapterText, serializeChapterText } from "./chapterContent";
import { needsAutomaticVersion, versionDate } from "./versionHistory";

describe("history policy", () => {
  it("compares changed words instead of only net word counts", () => {
    const before = serializeChapterText(Array(30).fill("antes").join(" "));
    const after = serializeChapterText(Array(30).fill("depois").join(" "));
    expect(needsAutomaticVersion(before, after, 1)).toBe(true);
    expect(needsAutomaticVersion(after, after, 999_000)).toBe(false);
    expect(needsAutomaticVersion(serializeChapterText("um"), serializeChapterText("dois"), 180_000)).toBe(true);
  });
  it("interprets legacy SQLite dates as UTC like ISO browser timestamps", () => {
    expect(versionDate("2026-10-23 12:30:00").toISOString()).toBe("2026-10-23T12:30:00.000Z");
    expect(versionDate("2026-10-23T09:30:00-03:00").toISOString()).toBe("2026-10-23T12:30:00.000Z");
  });
  it("reads historical block documents and nested text nodes without losing words", () => {
    const legacy = JSON.stringify({ blocks: [
      { type: "paragraph", content: [{ type: "text", text: "Era " }, { type: "text", text: "uma vez" }] },
      { type: "paragraph", text: "Outro parágrafo" },
    ] });
    expect(extractPlainText(parseChapterText(legacy))).toBe("Era uma vez\n\nOutro parágrafo");
  });
});
