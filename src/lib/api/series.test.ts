import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBook, getBookById, listBooks, updateBook } from "./books";
import { createSeries, deleteSeries, listSeries, reorderSeriesBooks, updateSeries } from "./series";
import { subscribeDataChanges } from "@/lib/data/changes";
import { createUniverse, deleteUniverse, listUniverses, updateUniverse } from "./universes";
import { createChapter, getChapterById } from "./chapters";

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

  it("moves a series between universes without detaching books or changing volumes", async () => {
    const first = await createUniverse({ profile_id: profileId, name: "Primeiro mundo" });
    const second = await createUniverse({ profile_id: profileId, name: "Segundo mundo" });
    const series = await createSeries({ profile_id: profileId, name: "Saga" });
    const created = await Promise.all(["Início", "Fim"].map((title) => createBook({
      profile_id: profileId, format_id: "fmt-br-14x21", font_preset_id: "font-merriweather",
      title, author_name: "Autor", series_id: series.id,
    })));
    await updateSeries(series.id, { universe_id: first.id });
    await updateSeries(series.id, { universe_id: second.id });
    for (const [index, book] of created.entries()) {
      expect(await getBookById(book.id)).toMatchObject({
        series_id: series.id, universe_id: second.id, series_volume: index + 1,
      });
    }
    await updateBook(created[0].id, { universe_id: first.id });
    expect(await getBookById(created[0].id)).toMatchObject({ series_id: series.id, universe_id: first.id, series_volume: 1 });
  });

  it.each([
    { linked: true, input: { clear_universe: true } },
    { linked: true, input: { universe_id: "" } },
    { linked: false, input: { clear_universe: true } },
  ])("removes universe membership from series books (linked=$linked, input=$input)", async ({ linked, input }) => {
    const universe = await createUniverse({ profile_id: profileId, name: "Mundo" });
    const series = await createSeries({ profile_id: profileId, name: "Saga", universe_id: linked ? universe.id : null });
    const makeBook = (title: string, seriesId?: string) => createBook({
      profile_id: profileId, format_id: "fmt-br-14x21", font_preset_id: "font-merriweather",
      title, author_name: "Autor", series_id: seriesId, universe_id: universe.id,
    });
    const volumes = [await makeBook("Primeiro", series.id), await makeBook("Segundo", series.id)];
    const standalone = await makeBook("Avulso");
    await updateSeries(series.id, { name: "Saga renomeada" });
    expect((await getBookById(volumes[0].id))?.universe_id).toBe(universe.id);
    const changes: string[] = [];
    const unsubscribe = subscribeDataChanges((change) => changes.push(change));
    try { await updateSeries(series.id, input); }
    finally { unsubscribe(); }
    expect(changes).toContain("books");
    for (const [index, volume] of volumes.entries()) {
      expect(await getBookById(volume.id)).toMatchObject({ universe_id: null, series_id: series.id, series_volume: index + 1 });
    }
    expect((await getBookById(standalone.id))?.universe_id).toBe(universe.id);
    expect(await listBooks(profileId)).toHaveLength(3);
    expect((await listSeries(profileId))[0].universe_id).toBeNull();
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

  it("edits universes and deletes a populated universe without deleting its series, books or chapters", async () => {
    const world = await createUniverse({ profile_id: profileId, name: "Aurora", description: "Mundo inicial" });
    await expect(updateUniverse(world.id, { name: " " })).rejects.toThrow("O nome do universo não pode ser vazio");
    await updateUniverse(world.id, { name: " Aurora revisada ", description: "" });
    expect((await listUniverses(profileId))[0]).toMatchObject({ name: "Aurora revisada", description: null });
    const saga = await createSeries({ profile_id: profileId, name: "Saga", universe_id: world.id });
    const input = { profile_id: profileId, format_id: "fmt-br-14x21", font_preset_id: "font-merriweather", author_name: "Autor" };
    const volume = await createBook({ ...input, title: "Volume", series_id: saga.id });
    const direct = await createBook({ ...input, title: "Avulso no universo", universe_id: world.id });
    const outside = await createBook({ ...input, title: "Fora do universo" });
    const chapter = await createChapter({ book_id: volume.id, title: "Capítulo preservado", content_json: "Texto preservado" });
    await deleteUniverse(world.id);
    expect(await listUniverses(profileId)).toHaveLength(0);
    expect((await listSeries(profileId))[0]).toMatchObject({ id: saga.id, universe_id: null });
    expect(await getBookById(volume.id)).toMatchObject({ series_id: saga.id, series_volume: 1, universe_id: null });
    expect(await getBookById(direct.id)).toMatchObject({ series_id: null, universe_id: null });
    expect(await getBookById(outside.id)).toEqual(outside);
    expect(await listBooks(profileId)).toHaveLength(3);
    expect(await getChapterById(chapter.id)).toEqual(chapter);
  });
});

