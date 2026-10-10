-- Migration: 20261010180000_add_chapter_type.sql
-- Descrição: Adiciona o tipo de capítulo (chapter_type) e título personalizado do tipo (custom_type_name)

ALTER TABLE chapters ADD COLUMN chapter_type TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE chapters ADD COLUMN custom_type_name TEXT;

