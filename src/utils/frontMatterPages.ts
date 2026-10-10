import type { BookFrontMatter } from "@/types/frontMatter";

export type FrontMatterPageKind =
  | "half-title"
  | "blank"
  | "title-page"
  | "copyright"
  | "dedication"
  | "epigraph";

export interface FrontMatterPageItem {
  pageNumber: number;
  kind: FrontMatterPageKind;
  label: string;
}

export function buildFrontMatterPages(
  frontMatter: BookFrontMatter | null,
): FrontMatterPageItem[] {
  if (!frontMatter) return [];

  const pages: FrontMatterPageItem[] = [];
  let current = 1;

  if (frontMatter.include_half_title) {
    pages.push({ pageNumber: current++, kind: "half-title", label: "Falsa folha de rosto" });
    pages.push({ pageNumber: current++, kind: "blank", label: "Verso em branco" });
  }

  if (frontMatter.include_title_page) {
    pages.push({ pageNumber: current++, kind: "title-page", label: "Folha de rosto" });
    if (frontMatter.include_copyright_page) {
      pages.push({ pageNumber: current++, kind: "copyright", label: "Folha de copyright" });
    }
  }

  if (frontMatter.include_dedication && frontMatter.dedication_text?.trim()) {
    pages.push({ pageNumber: current++, kind: "dedication", label: "Dedicatória" });
    pages.push({ pageNumber: current++, kind: "blank", label: "Verso em branco" });
  }

  if (frontMatter.include_epigraph && frontMatter.epigraph_text?.trim()) {
    pages.push({ pageNumber: current++, kind: "epigraph", label: "Epígrafe" });
    pages.push({ pageNumber: current++, kind: "blank", label: "Verso em branco" });
  }

  return pages;
}

