"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createBook,
  deleteBook,
  listBooks,
  updateBook,
} from "@/lib/api/books";
import type { Book, CreateBookInput, UpdateBookInput } from "@/types/book";

export interface UseBooksReturn {
  books: Book[];
  isLoading: boolean;
  error: string | null;
  refreshBooks: () => Promise<void>;
  addBook: (input: CreateBookInput) => Promise<Book>;
  editBook: (id: string, input: UpdateBookInput) => Promise<Book>;
  removeBook: (id: string) => Promise<void>;
}

/**
 * Hook para gerenciar o ciclo de vida e a lista de livros do perfil ativo.
 * Trata carregamento inicial, criação, atualização e exclusão otimista/reativa.
 */
export function useBooks(profileId?: string | null): UseBooksReturn {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(profileId));
  const [error, setError] = useState<string | null>(null);

  const refreshBooks = useCallback(async () => {
    if (!profileId) {
      setBooks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await listBooks(profileId);
      setBooks(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  const addBook = useCallback(
    async (input: CreateBookInput): Promise<Book> => {
      setError(null);
      try {
        const newBook = await createBook(input);
        setBooks((prev) => [newBook, ...prev]);
        return newBook;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        throw err;
      }
    },
    [],
  );

  const editBook = useCallback(
    async (id: string, input: UpdateBookInput): Promise<Book> => {
      setError(null);
      try {
        const updated = await updateBook(id, input);
        setBooks((prev) =>
          prev.map((book) => (book.id === id ? updated : book)),
        );
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        throw err;
      }
    },
    [],
  );

  const removeBook = useCallback(
    async (id: string): Promise<void> => {
      setError(null);
      try {
        await deleteBook(id);
        setBooks((prev) => prev.filter((book) => book.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        throw err;
      }
    },
    [],
  );

  useEffect(() => {
    void refreshBooks();
  }, [refreshBooks]);

  return {
    books,
    isLoading,
    error,
    refreshBooks,
    addBook,
    editBook,
    removeBook,
  };
}
