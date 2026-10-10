-- Migration: 20261010160000_create_book_front_matter.sql
-- Descrição: Metadados e configuração de páginas pré-textuais do livro (Front Matter)

CREATE TABLE IF NOT EXISTS book_front_matter (
    book_id TEXT PRIMARY KEY NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    include_half_title INTEGER NOT NULL DEFAULT 1 CHECK (include_half_title IN (0, 1)),
    include_title_page INTEGER NOT NULL DEFAULT 1 CHECK (include_title_page IN (0, 1)),
    subtitle TEXT,
    publisher TEXT,
    edition TEXT NOT NULL DEFAULT '1ª edição',
    publication_year INTEGER,
    publication_city TEXT,
    include_copyright_page INTEGER NOT NULL DEFAULT 1 CHECK (include_copyright_page IN (0, 1)),
    copyright_text TEXT,
    isbn_print TEXT,
    isbn_digital TEXT,
    cover_designer TEXT,
    proofreader TEXT,
    layout_designer TEXT,
    cataloging_data TEXT,
    include_dedication INTEGER NOT NULL DEFAULT 0 CHECK (include_dedication IN (0, 1)),
    dedication_text TEXT,
    include_epigraph INTEGER NOT NULL DEFAULT 0 CHECK (include_epigraph IN (0, 1)),
    epigraph_text TEXT,
    epigraph_author TEXT,
    include_table_of_contents INTEGER NOT NULL DEFAULT 1 CHECK (include_table_of_contents IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

