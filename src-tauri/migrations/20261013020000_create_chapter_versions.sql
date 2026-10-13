-- Migration: 20261013020000_create_chapter_versions.sql
-- Descrição: Tabela para histórico de versões e snapshots de capítulos (track changes)

CREATE TABLE IF NOT EXISTS chapter_versions (
    id TEXT PRIMARY KEY NOT NULL,
    chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL CHECK (version_number > 0),
    title TEXT NOT NULL,
    content_json TEXT NOT NULL,
    description TEXT,
    word_count INTEGER NOT NULL DEFAULT 0 CHECK (word_count >= 0),
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chapter_versions_chapter_number ON chapter_versions (chapter_id, version_number DESC);

