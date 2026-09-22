-- Migration: 20260922001112_create_database.sql
-- Descrição: Modelo inicial do banco de dados local (SQLite) baseado em docs/architecture/database.dbml
-- IDs: UUIDv7 gerado localmente (TEXT). Datas: ISO 8601 em UTC (TEXT).

PRAGMA foreign_keys = ON;

-- 1. Perfil local do usuário (MVP: uma instalação usa um perfil local)
CREATE TABLE IF NOT EXISTS local_profiles (
    id TEXT PRIMARY KEY NOT NULL,
    display_name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 2. Catálogo de formatos de livros (dimensões pré-definidas em micrômetros)
CREATE TABLE IF NOT EXISTS book_formats (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    market TEXT NOT NULL CHECK (market IN ('BR', 'US', 'GB')),
    width_um INTEGER NOT NULL CHECK (width_um > 0),
    height_um INTEGER NOT NULL CHECK (height_um > 0),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1))
);

-- 3. Catálogo de presets de fontes embutidas no app
CREATE TABLE IF NOT EXISTS font_presets (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    family_name TEXT NOT NULL,
    manifest_path TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1))
);

-- 4. Livros (entidade principal da biblioteca)
CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY NOT NULL,
    profile_id TEXT NOT NULL REFERENCES local_profiles(id) ON DELETE RESTRICT,
    format_id TEXT NOT NULL REFERENCES book_formats(id) ON DELETE RESTRICT,
    font_preset_id TEXT NOT NULL REFERENCES font_presets(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    author_name TEXT NOT NULL,
    card_image_asset_id TEXT REFERENCES image_assets(id) ON DELETE RESTRICT,
    position INTEGER NOT NULL CHECK (position >= 0),
    font_size_pt REAL NOT NULL CHECK (font_size_pt > 0),
    line_height_ratio REAL NOT NULL CHECK (line_height_ratio > 0),
    margin_top_um INTEGER NOT NULL CHECK (margin_top_um >= 0),
    margin_bottom_um INTEGER NOT NULL CHECK (margin_bottom_um >= 0),
    margin_left_um INTEGER NOT NULL CHECK (margin_left_um >= 0),
    margin_right_um INTEGER NOT NULL CHECK (margin_right_um >= 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_books_profile_position ON books (profile_id, position);
CREATE INDEX IF NOT EXISTS idx_books_format_id ON books (format_id);
CREATE INDEX IF NOT EXISTS idx_books_font_preset_id ON books (font_preset_id);

-- 5. Imagens e ilustrações (armazenadas em disco, metadados no SQLite)
CREATE TABLE IF NOT EXISTS image_assets (
    id TEXT PRIMARY KEY NOT NULL,
    book_id TEXT NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
    original_filename TEXT NOT NULL,
    storage_key TEXT NOT NULL UNIQUE,
    mime_type TEXT NOT NULL,
    width_px INTEGER NOT NULL CHECK (width_px > 0),
    height_px INTEGER NOT NULL CHECK (height_px > 0),
    byte_size INTEGER NOT NULL CHECK (byte_size > 0),
    sha256 TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_image_assets_book_id ON image_assets (book_id);

-- 6. Capítulos do livro (documento canônico com blocos JSON)
CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY NOT NULL,
    book_id TEXT NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    position INTEGER NOT NULL CHECK (position >= 0),
    content_json TEXT NOT NULL,
    content_schema_version INTEGER NOT NULL DEFAULT 1 CHECK (content_schema_version >= 1),
    content_revision INTEGER NOT NULL DEFAULT 0 CHECK (content_revision >= 0),
    track_changes_enabled INTEGER NOT NULL DEFAULT 0 CHECK (track_changes_enabled IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_chapters_book_position ON chapters (book_id, position);

-- 7. Comentários de revisão ancorados no texto
CREATE TABLE IF NOT EXISTS review_comments (
    id TEXT PRIMARY KEY NOT NULL,
    chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE RESTRICT,
    author_profile_id TEXT NOT NULL REFERENCES local_profiles(id) ON DELETE RESTRICT,
    body TEXT NOT NULL,
    original_excerpt TEXT NOT NULL,
    anchor_json TEXT,
    anchor_revision INTEGER NOT NULL CHECK (anchor_revision >= 0),
    anchor_state TEXT NOT NULL DEFAULT 'attached' CHECK (anchor_state IN ('attached', 'removed')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    resolved_at TEXT,
    CHECK (
        (anchor_state = 'attached' AND anchor_json IS NOT NULL)
        OR (anchor_state = 'removed' AND anchor_json IS NULL)
    ),
    CHECK (
        (status = 'open' AND resolved_at IS NULL)
        OR (status = 'resolved' AND resolved_at IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_review_comments_chapter_status ON review_comments (chapter_id, status);
CREATE INDEX IF NOT EXISTS idx_review_comments_author_profile_id ON review_comments (author_profile_id);

-- 8. Progresso de revisão por capítulo
CREATE TABLE IF NOT EXISTS review_progress (
    chapter_id TEXT PRIMARY KEY NOT NULL REFERENCES chapters(id) ON DELETE RESTRICT,
    profile_id TEXT NOT NULL REFERENCES local_profiles(id) ON DELETE RESTRICT,
    anchor_json TEXT,
    anchor_revision INTEGER NOT NULL CHECK (anchor_revision >= 0),
    reviewed_content_revision INTEGER NOT NULL CHECK (reviewed_content_revision >= 0),
    needs_recheck INTEGER NOT NULL DEFAULT 0 CHECK (needs_recheck IN (0, 1)),
    marked_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    CHECK (
        anchor_json IS NOT NULL
        OR needs_recheck = 1
    )
);
