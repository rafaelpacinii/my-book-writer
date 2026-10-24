import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBook, getBookById, listBooks, updateBook } from "./books";
import { createSeries, deleteSeries, listSeries, reorderSeriesBooks } from "./series";
import { createUniverse, deleteUniverse, listUniverses } from "./universes";

describe("universes and series persistence and volume auto-numbering", () => {
  const data = new Map<string, string>();
  const profileId = "local-default-id";

  beforeEach(() => {
    data.clear();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("auto-numbers volumes in a series, inherits universe, and reorders cleanly", async () => {
    const universe = await createUniverse({
      profile_id: profileId,
      name: "Legendarium",
      description: "Terra-média",
    });

    const series = await createSeries({
      profile_id: profileId,
      universe_id: universe.id,
      name: "O Senhor dos Anéis",
    });

    const b1 = await createBook({
      profile_id: profileId,
      format_id: "fmt-br-14x21",
      font_preset_id: "font-merriweather",
      series_id: series.id,
      title: "A Sociedade do Anel",
      author_name: "J.R.R. Tolkien",
    });

    const b2 = await createBook({
      profile_id: profileId,
      format_id: "fmt-br-14x21",
      font_preset_id: "font-merriweather",
      series_id: series.id,
      title: "As Duas Torres",
      author_name: "J.R.R. Tolkien",
    });

    const b3 = await createBook({
      profile_id: profileId,
      format_id: "fmt-br-14x21",
      font_preset_id: "font-merriweather",
      series_id: series.id,
      title: "O Retorno do Rei",
      author_name: "J.R.R. Tolkien",
    });

    expect(b1.series_volume).toBe(1);
    expect(b2.series_volume).toBe(2);
    expect(b3.series_volume).toBe(3);
    expect(b1.universe_id).toBe(universe.id);

    const reordered = await reorderSeriesBooks(series.id, [b3.id, b1.id, b2.id]);
    expect(reordered.map((b) => [b.title, b.series_volume])).toEqual([
      ["O Retorno do Rei", 1],
      ["A Sociedade do Anel", 2],
      ["As Duas Torres", 3],
    ]);

    await updateBook(b1.id, { clear_series: true });
    const remainingLast = await getBookById(b2.id);
    expect(remainingLast?.series_volume).toBe(2);
  });

  it("cleans up references when deleting a series or universe", async () => {
    const universe = await createUniverse({ profile_id: profileId, name: "Cosmere" });
    const series = await createSeries({
      profile_id: profileId,
      universe_id: universe.id,
      name: "Os Relatos da Guerra das Tempestades",
    });
    const book = await createBook({
      profile_id: profileId,
      format_id: "fmt-br-14x21",
      font_preset_id: "font-merriweather",
      series_id: series.id,
      title: "O Caminho dos Reis",
      author_name: "Brandon Sanderson",
    });

    await deleteSeries(series.id);
    expect(await listSeries(profileId)).toHaveLength(0);
    const afterSeriesDelete = await getBookById(book.id);
    expect(afterSeriesDelete?.series_id).toBeNull();
    expect(afterSeriesDelete?.series_volume).toBeNull();
    expect(afterSeriesDelete?.universe_id).toBe(universe.id);

    await deleteUniverse(universe.id);
    expect(await listUniverses(profileId)).toHaveLength(0);
    const afterUniverseDelete = (await listBooks(profileId))[0];
    expect(afterUniverseDelete.universe_id).toBeNull();
  });
});

