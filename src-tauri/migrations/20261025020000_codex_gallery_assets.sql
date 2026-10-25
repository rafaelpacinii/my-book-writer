-- Preserva IDs e referências das capas e permite imagens de fichas sem Livro.
PRAGMA defer_foreign_keys = ON;
CREATE TABLE image_assets_next (
 id TEXT PRIMARY KEY NOT NULL,
 book_id TEXT REFERENCES books(id) ON DELETE RESTRICT,
 codex_entity_id TEXT REFERENCES codex_entities(id) ON DELETE RESTRICT,
 original_filename TEXT NOT NULL, storage_key TEXT NOT NULL UNIQUE, mime_type TEXT NOT NULL,
 width_px INTEGER NOT NULL CHECK(width_px>0), height_px INTEGER NOT NULL CHECK(height_px>0),
 byte_size INTEGER NOT NULL CHECK(byte_size>0), sha256 TEXT NOT NULL, created_at TEXT NOT NULL,
 CHECK ((book_id IS NOT NULL) != (codex_entity_id IS NOT NULL))
);
INSERT INTO image_assets_next (id,book_id,original_filename,storage_key,mime_type,width_px,height_px,byte_size,sha256,created_at)
SELECT id,book_id,original_filename,storage_key,mime_type,width_px,height_px,byte_size,sha256,created_at FROM image_assets;
DROP TABLE image_assets;
ALTER TABLE image_assets_next RENAME TO image_assets;
CREATE INDEX idx_image_assets_book_id ON image_assets(book_id);
CREATE INDEX idx_image_assets_codex ON image_assets(codex_entity_id);
CREATE INDEX idx_codex_images_entity ON codex_entity_images(entity_id,position);
-- SQLite retém contadores diferidos do DROP mesmo após reconstruir a tabela.
-- Verifica todos os FKs reais antes de encerrar o adiamento na transação.
CREATE TEMP TABLE codex_gallery_integrity (violations INTEGER CHECK(violations=0));
INSERT INTO codex_gallery_integrity SELECT count(*) FROM pragma_foreign_key_check;
DROP TABLE codex_gallery_integrity;
PRAGMA defer_foreign_keys = OFF;
