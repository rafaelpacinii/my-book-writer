import { expect, it } from "vitest";
import { newBookCollectionInput } from "@/utils/newBookCollections";

it("keeps standalone creation possible and rejects stale collection links", () => {
  expect(newBookCollectionInput("", "", [], [])).toEqual({ series_id: null, universe_id: null });
  expect(() => newBookCollectionInput("deleted", "", [], [])).toThrow("A série selecionada não está disponível");
  expect(() => newBookCollectionInput("", "deleted", [], [])).toThrow("O universo selecionado não está disponível");
});
