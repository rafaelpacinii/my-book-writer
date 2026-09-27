import { invoke } from "@tauri-apps/api/core";
import type { Chapter, ChapterSummary, CreateChapterInput } from "@/types/chapter";

/**
 * Cria um novo capítulo no livro.
 */
export async function createChapter(input: CreateChapterInput): Promise<Chapter> {
  return invoke<Chapter>("create_chapter", { input });
}

/**
 * Lista o sumário resumido dos capítulos ativos de um livro (ordenados por posição).
 */
export async function listChapters(bookId: string): Promise<ChapterSummary[]> {
  return invoke<ChapterSummary[]>("list_chapters", { bookId });
}

/**
 * Carrega os dados completos de um capítulo, incluindo o conteúdo canônico em JSON.
 */
export async function getChapterById(id: string): Promise<Chapter | null> {
  return invoke<Chapter | null>("get_chapter_by_id", { id });
}

/**
 * Atualiza o título de um capítulo.
 */
export async function updateChapterTitle(id: string, title: string): Promise<Chapter> {
  return invoke<Chapter>("update_chapter_title", { id, title });
}

/**
 * Salva o conteúdo em JSON do capítulo com verificação de concorrência otimista (optimistic locking).
 */
export async function saveChapterContent(
  id: string,
  expectedRevision: number,
  contentJson: string,
): Promise<Chapter> {
  return invoke<Chapter>("save_chapter_content", {
    id,
    expectedRevision,
    contentJson,
  });
}

/**
 * Reordena os capítulos de um livro em uma transação atômica.
 */
export async function reorderChapters(
  bookId: string,
  chapterIds: string[],
): Promise<void> {
  return invoke<void>("reorder_chapters", { bookId, chapterIds });
}

/**
 * Exclui logicamente (soft delete) um capítulo.
 */
export async function deleteChapter(id: string): Promise<void> {
  return invoke<void>("delete_chapter", { id });
}
