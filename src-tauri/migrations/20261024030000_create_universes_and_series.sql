-- Migration: 20261024030000_create_universes_and_series.sql
-- Descrição: Cria suporte a Universos Literários e Séries de Livros com numeração automática de volumes.

PRAGMA foreign_keys = ON;

-- 1. Universos Literários (mundo compartilhado entre livros e séries)
CREATE TABLE IF NOT EXISTS universes (
    id TEXT PRIMARY KEY NOT NULL,
    profile_id TEXT NOT NULL REFERENCES local_profiles(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    position INTEGER NOT NULL CHECK (position >= 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_universes_profile_position ON universes (profile_id, position);

-- 2. Séries de Livros (trilogias, sagas e coleções ordenadas)
CREATE TABLE IF NOT EXISTS book_series (
    id TEXT PRIMARY KEY NOT NULL,
    profile_id TEXT NOT NULL REFERENCES local_profiles(id) ON DELETE RESTRICT,
    universe_id TEXT REFERENCES universes(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    position INTEGER NOT NULL CHECK (position >= 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_book_series_profile_position ON book_series (profile_id, position);
CREATE INDEX IF NOT EXISTS idx_book_series_universe_id ON book_series (universe_id);

-- 3. Vínculo opcional de livros com Universos e Séries (e numeração automática de volume 1..N)
ALTER TABLE books ADD COLUMN universe_id TEXT REFERENCES universes(id) ON DELETE SET NULL;
ALTER TABLE books ADD COLUMN series_id TEXT REFERENCES book_series(id) ON DELETE SET NULL;
ALTER TABLE books ADD COLUMN series_volume INTEGER CHECK (series_volume IS NULL OR series_volume >= 1);

CREATE INDEX IF NOT EXISTS idx_books_universe_id ON books (universe_id);
CREATE INDEX IF NOT EXISTS idx_books_series_volume ON books (series_id, series_volume);

