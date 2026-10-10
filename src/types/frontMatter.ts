export interface BookFrontMatter {
  book_id: string;
  include_half_title: boolean;
  include_title_page: boolean;
  subtitle: string | null;
  publisher: string | null;
  edition: string;
  publication_year: number | null;
  publication_city: string | null;
  include_copyright_page: boolean;
  copyright_text: string | null;
  isbn_print: string | null;
  isbn_digital: string | null;
  cover_designer: string | null;
  proofreader: string | null;
  layout_designer: string | null;
  cataloging_data: string | null;
  include_dedication: boolean;
  dedication_text: string | null;
  include_epigraph: boolean;
  epigraph_text: string | null;
  epigraph_author: string | null;
  include_table_of_contents: boolean;
  created_at: string;
  updated_at: string;
}

export type SaveFrontMatterInput = Omit<BookFrontMatter, "created_at" | "updated_at">;

