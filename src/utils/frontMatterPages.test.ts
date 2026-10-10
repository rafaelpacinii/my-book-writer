import { expect, test } from "vitest";
import { buildFrontMatterPages } from "./frontMatterPages";
import type { BookFrontMatter } from "@/types/frontMatter";

test("builds correct front matter pages when all enabled", () => {
  const fm: BookFrontMatter = {
    book_id: "b1",
    include_half_title: true,
    include_title_page: true,
    subtitle: "Subtítulo",
    publisher: "Editora",
    edition: "1ª edição",
    publication_year: 2026,
    publication_city: "São Paulo",
    include_copyright_page: true,
    copyright_text: "© 2026 Autor",
    isbn_print: null,
    isbn_digital: null,
    cover_designer: null,
    proofreader: null,
    layout_designer: null,
    cataloging_data: null,
    include_dedication: true,
    dedication_text: "Para minha família",
    include_epigraph: true,
    epigraph_text: "Frase célebre",
    epigraph_author: "Autor célebre",
    include_table_of_contents: true,
    created_at: "",
    updated_at: "",
  };

  const pages = buildFrontMatterPages(fm);
  expect(pages).toHaveLength(8);
  expect(pages[0]).toEqual({ pageNumber: 1, kind: "half-title", label: "Falsa folha de rosto" });
  expect(pages[1]).toEqual({ pageNumber: 2, kind: "blank", label: "Verso em branco" });
  expect(pages[2]).toEqual({ pageNumber: 3, kind: "title-page", label: "Folha de rosto" });
  expect(pages[3]).toEqual({ pageNumber: 4, kind: "copyright", label: "Folha de copyright" });
  expect(pages[4]).toEqual({ pageNumber: 5, kind: "dedication", label: "Dedicatória" });
  expect(pages[5]).toEqual({ pageNumber: 6, kind: "blank", label: "Verso em branco" });
  expect(pages[6]).toEqual({ pageNumber: 7, kind: "epigraph", label: "Epígrafe" });
  expect(pages[7]).toEqual({ pageNumber: 8, kind: "blank", label: "Verso em branco" });
});

test("returns empty list if frontMatter is null or all disabled", () => {
  expect(buildFrontMatterPages(null)).toEqual([]);
  const fmEmpty: BookFrontMatter = {
    book_id: "b1",
    include_half_title: false,
    include_title_page: false,
    subtitle: null,
    publisher: null,
    edition: "1ª edição",
    publication_year: null,
    publication_city: null,
    include_copyright_page: false,
    copyright_text: null,
    isbn_print: null,
    isbn_digital: null,
    cover_designer: null,
    proofreader: null,
    layout_designer: null,
    cataloging_data: null,
    include_dedication: false,
    dedication_text: null,
    include_epigraph: false,
    epigraph_text: null,
    epigraph_author: null,
    include_table_of_contents: false,
    created_at: "",
    updated_at: "",
  };
  expect(buildFrontMatterPages(fmEmpty)).toEqual([]);
});

