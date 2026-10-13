import { describe, expect, it } from "vitest";
import { computeWordDiff, indexDiffChanges } from "./textDiff";

describe("computeWordDiff", () => {
  it("identifica texto inalterado", () => {
    const diff = computeWordDiff("Era uma vez", "Era uma vez");
    expect(diff).toEqual([{ type: "unchanged", value: "Era uma vez" }]);
  });

  it("identifica adições de palavras", () => {
    const diff = computeWordDiff("Era uma vez", "Era uma linda vez");
    expect(diff.some((d) => d.type === "added" && d.value.includes("linda"))).toBe(true);
  });

  it("identifica remoções de palavras", () => {
    const diff = computeWordDiff("Era um reino muito distante", "Era um reino distante");
    expect(diff.some((d) => d.type === "removed" && d.value.includes("muito"))).toBe(true);
  });

  it("lida com textos vazios", () => {
    expect(computeWordDiff("", "")).toEqual([]);
    expect(computeWordDiff("", "novo")).toEqual([{ type: "added", value: "novo" }]);
    expect(computeWordDiff("antigo", "")).toEqual([{ type: "removed", value: "antigo" }]);
  });

  it("indexa alterações corretamente", () => {
    const diff = computeWordDiff("O gato dormia", "O cão dormia rápido");
    const indexed = indexDiffChanges(diff);
    expect(indexed.totalChanges).toBeGreaterThan(0);
    expect(indexed.additions).toBeGreaterThan(0);
    expect(indexed.deletions).toBeGreaterThan(0);
    const nonUnchanged = indexed.parts.filter((p) => p.type !== "unchanged");
    expect(nonUnchanged[0].changeIndex).toBe(1);
  });
});
