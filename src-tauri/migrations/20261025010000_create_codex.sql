-- Códice: fichas pertencem a exatamente um Livro ou Universo do mesmo perfil.
CREATE TABLE codex_entities (
    id TEXT PRIMARY KEY NOT NULL,
    profile_id TEXT NOT NULL REFERENCES local_profiles(id) ON DELETE RESTRICT,
    book_id TEXT REFERENCES books(id) ON DELETE RESTRICT,
    universe_id TEXT REFERENCES universes(id) ON DELETE RESTRICT,
    kind TEXT NOT NULL CHECK (kind IN ('character', 'location', 'lore')),
    name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 160),
    summary TEXT,
    role TEXT,
    status TEXT,
    archetype TEXT,
    tags_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(tags_json) AND json_type(tags_json) = 'array'),
    position INTEGER NOT NULL CHECK (position >= 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    CHECK ((book_id IS NOT NULL) != (universe_id IS NOT NULL))
);
CREATE INDEX idx_codex_entities_book ON codex_entities(book_id, kind, position) WHERE deleted_at IS NULL;
CREATE INDEX idx_codex_entities_universe ON codex_entities(universe_id, kind, position) WHERE deleted_at IS NULL;
CREATE INDEX idx_codex_entities_profile ON codex_entities(profile_id);

CREATE TABLE codex_categories (
    id TEXT PRIMARY KEY NOT NULL,
    entity_id TEXT NOT NULL REFERENCES codex_entities(id) ON DELETE RESTRICT,
    name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 160),
    position INTEGER NOT NULL CHECK (position >= 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);
CREATE INDEX idx_codex_categories_entity ON codex_categories(entity_id, position);
CREATE TABLE codex_fields (
    id TEXT PRIMARY KEY NOT NULL,
    category_id TEXT NOT NULL REFERENCES codex_categories(id) ON DELETE RESTRICT,
    label TEXT NOT NULL CHECK (length(trim(label)) BETWEEN 1 AND 160),
    field_type TEXT NOT NULL CHECK (field_type IN ('short_text', 'long_text', 'tags', 'scale', 'reference', 'document')),
    value_json TEXT NOT NULL CHECK (json_valid(value_json)),
    config_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(config_json) AND json_type(config_json) = 'object'),
    position INTEGER NOT NULL CHECK (position >= 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);
CREATE INDEX idx_codex_fields_category ON codex_fields(category_id, position);
CREATE TABLE codex_entity_images (
    id TEXT PRIMARY KEY NOT NULL,
    entity_id TEXT NOT NULL REFERENCES codex_entities(id) ON DELETE RESTRICT,
    image_asset_id TEXT NOT NULL REFERENCES image_assets(id) ON DELETE RESTRICT,
    caption TEXT,
    is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
    position INTEGER NOT NULL CHECK (position >= 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);
CREATE UNIQUE INDEX idx_codex_primary_image ON codex_entity_images(entity_id) WHERE is_primary = 1 AND deleted_at IS NULL;
CREATE UNIQUE INDEX idx_codex_image_asset ON codex_entity_images(entity_id, image_asset_id) WHERE deleted_at IS NULL;
CREATE TABLE codex_templates (
    id TEXT PRIMARY KEY NOT NULL,
    profile_id TEXT NOT NULL REFERENCES local_profiles(id) ON DELETE RESTRICT,
    kind TEXT NOT NULL CHECK (kind IN ('character', 'location', 'lore')),
    name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 160),
    preset_key TEXT,
    schema_json TEXT NOT NULL CHECK (json_valid(schema_json) AND json_type(schema_json) = 'array'),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    UNIQUE (profile_id, preset_key)
);
CREATE INDEX idx_codex_templates_profile ON codex_templates(profile_id, kind) WHERE deleted_at IS NULL;

-- UUIDs, estrutura, imagens e conteúdo permanecem iguais ao compartilhar uma ficha.
-- Participa da transação existente de Livro/Série e também cobre atualizações SQL diretas.
CREATE TRIGGER codex_promote_book AFTER UPDATE OF universe_id, series_id ON books
WHEN NEW.deleted_at IS NULL
BEGIN
    UPDATE codex_entities SET
        universe_id = COALESCE(
            (SELECT id FROM universes WHERE id = NEW.universe_id AND profile_id = NEW.profile_id AND deleted_at IS NULL),
            (SELECT u.id FROM book_series s JOIN universes u ON u.id = s.universe_id
             WHERE s.id = NEW.series_id AND s.profile_id = NEW.profile_id AND s.deleted_at IS NULL AND u.deleted_at IS NULL)
        ), book_id = NULL, updated_at = datetime('now')
    WHERE book_id = NEW.id AND profile_id = NEW.profile_id
      AND COALESCE(
        (SELECT id FROM universes WHERE id = NEW.universe_id AND profile_id = NEW.profile_id AND deleted_at IS NULL),
        (SELECT u.id FROM book_series s JOIN universes u ON u.id = s.universe_id
         WHERE s.id = NEW.series_id AND s.profile_id = NEW.profile_id AND s.deleted_at IS NULL AND u.deleted_at IS NULL)
      ) IS NOT NULL;
END;

-- Impede entidades em agrupadores de outro perfil, inclusive quando criadas fora dos serviços.
CREATE TRIGGER codex_entity_scope_insert BEFORE INSERT ON codex_entities BEGIN
    SELECT CASE WHEN NEW.book_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM books WHERE id = NEW.book_id AND profile_id = NEW.profile_id
    ) THEN RAISE(ABORT, 'codex_book_profile') END;
    SELECT CASE WHEN NEW.universe_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM universes WHERE id = NEW.universe_id AND profile_id = NEW.profile_id
    ) THEN RAISE(ABORT, 'codex_universe_profile') END;
END;
CREATE TRIGGER codex_entity_scope_update BEFORE UPDATE OF profile_id, book_id, universe_id ON codex_entities BEGIN
    SELECT CASE WHEN NEW.book_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM books WHERE id = NEW.book_id AND profile_id = NEW.profile_id
    ) THEN RAISE(ABORT, 'codex_book_profile') END;
    SELECT CASE WHEN NEW.universe_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM universes WHERE id = NEW.universe_id AND profile_id = NEW.profile_id
    ) THEN RAISE(ABORT, 'codex_universe_profile') END;
END;
