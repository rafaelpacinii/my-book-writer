-- Add migration script here
-- Migration: 20260924000001_seed_initial_data.sql
-- Descrição: Carga inicial de formatos de livros, presets de fontes e perfil local padrão.

-- 1. Perfil local padrão para a instalação inicial (MVP: 1 perfil ativo)
INSERT OR IGNORE INTO local_profiles (id, display_name, created_at, updated_at)
VALUES (
    '019213bc-0000-7000-8000-000000000001',
    'Autor',
    datetime('now'),
    datetime('now')
);

-- 2. Catálogo de formatos de livros pré-definidos (dimensões em micrômetros: 1000 um = 1 mm)
-- Mercado Brasileiro (BR)
INSERT OR IGNORE INTO book_formats (id, name, market, width_um, height_um, is_active)
VALUES
    ('fmt-br-14x21', '14 x 21 cm (Padrão Nacional)', 'BR', 140000, 210000, 1),
    ('fmt-br-16x23', '16 x 23 cm (Formato Médio)', 'BR', 160000, 230000, 1),
    ('fmt-br-a5', 'A5 (14,8 x 21 cm)', 'BR', 148000, 210000, 1),
    ('fmt-br-bolso', 'Bolso (10,5 x 17,5 cm)', 'BR', 105000, 175000, 1);

-- Mercado Norte-Americano (US)
INSERT OR IGNORE INTO book_formats (id, name, market, width_um, height_um, is_active)
VALUES
    ('fmt-us-trade-6x9', 'Trade (6 x 9 in)', 'US', 152400, 228600, 1),
    ('fmt-us-digest-5.5x8.5', 'Digest (5.5 x 8.5 in)', 'US', 139700, 215900, 1);

-- 3. Catálogo de presets de fontes embutidas disponíveis offline
INSERT OR IGNORE INTO font_presets (id, name, family_name, manifest_path, is_active)
VALUES
    ('font-eb-garamond', 'EB Garamond (Clássica)', 'EB Garamond', 'fonts/eb-garamond/manifest.json', 1),
    ('font-merriweather', 'Merriweather (Moderna)', 'Merriweather', 'fonts/merriweather/manifest.json', 1),
    ('font-inter', 'Inter (Sem Serifa)', 'Inter', 'fonts/inter/manifest.json', 1);