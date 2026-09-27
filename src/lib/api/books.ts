import { invoke } from "@tauri-apps/api/core";
import type { Book, CreateBookInput, UpdateBookInput } from "@/types/book";

/**
 * Cria um novo livro na biblioteca local.
 */
export async function createBook(input: CreateBookInput): Promise<Book> {
  return invoke<Book>("create_book", { input });
}

/**
 * Lista todos os livros ativos pertencentes a um perfil.
 */
export async function listBooks(profileId: string): Promise<Book[]> {
  return invoke<Book[]>("list_books", { profileId });
}

/**
 * Busca um livro pelo seu identificador único.
 */
export async function getBookById(id: string): Promise<Book | null> {
  return invoke<Book | null>("get_book_by_id", { id });
}

/**
 * Atualiza configurações ou metadados de um livro.
 */
export async function updateBook(id: string, input: UpdateBookInput): Promise<Book> {
  return invoke<Book>("update_book", { id, input });
}

/**
 * Exclui logicamente (soft delete) um livro da biblioteca.
 */
export async function deleteBook(id: string): Promise<void> {
  return invoke<void>("delete_book", { id });
}
