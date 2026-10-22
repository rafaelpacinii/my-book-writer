"use client";

import { useCallback, useState } from "react";
import type { CreateBookInput, UpdateBookInput } from "@/types/book";
import { createBook, deleteBook, updateBook } from "@/lib/api/books";
import { booksResource, emptyBooksResource } from "@/lib/data/appResources";
import { useResource } from "@/hooks/useResource";

export function useBooks(profileId?: string | null) {
  const [mutationError, setMutationError] = useState<string | null>(null);
  const resource = profileId ? booksResource(profileId) : emptyBooksResource;
  const books = useResource(resource);
  async function mutate<T>(action: () => Promise<T>) {
    setMutationError(null);
    try { return await action(); }
    catch (error) {
      setMutationError(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  const refresh = books.refresh;
  const refreshBooks = useCallback(() => {
    setMutationError(null);
    return refresh();
  }, [refresh]);
  return {
    books: books.data ?? [],
    isLoading: Boolean(profileId) && books.isLoading,
    isRefreshing: books.isRefreshing,
    error: mutationError || books.error,
    refreshBooks,
    addBook: (input: CreateBookInput) => mutate(() => createBook(input)),
    editBook: (id: string, input: UpdateBookInput) => mutate(() => updateBook(id, input)),
    removeBook: (id: string) => mutate(() => deleteBook(id)),
  };
}

export type UseBooksReturn = ReturnType<typeof useBooks>;
