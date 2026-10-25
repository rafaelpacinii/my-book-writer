"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useBookCrumbs } from "@/hooks/useBookCrumbs";
import type { Book } from "@/types/book";
import type { TitleBarCrumb } from "@/types/navigation";
import { useLibraryCrumbs } from "@/hooks/useLibraryCrumbs";
import { getBookById } from "@/lib/api/books";
import { subscribeDataChanges } from "@/lib/data/changes";

export type { TitleBarCrumb } from "@/types/navigation";

const subPages: Record<string, string> = {
  "/books/editor": "Editor",
  "/books/preview": "Prévia",
  "/books/export": "Exportar",
  "/books/versions": "Histórico",
  "/books/front-matter": "Pré-textuais",
  "/books/settings": "Configurações",
};

export function useTitleBarCrumbs(): TitleBarCrumb[] {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const libraryCrumbs = useLibraryCrumbs(pathname === "/library", searchParams.get("seriesId"), searchParams.get("universeId"));
  const bookId = searchParams.get("bookId") ?? "";
  const chapterId = searchParams.get("chapterId") ?? "";
  const [book, setBook] = useState<Book | null>(null);

  const currentBook = book?.id === bookId ? book : null;
  const ancestors = useBookCrumbs(currentBook);

  useEffect(() => {
    if (!bookId) return;
    let active = true;
    let sequence = 0;
    const load = () => {
      const request = ++sequence;
      void getBookById(bookId).then((loaded) => {
        if (active && request === sequence) setBook(loaded);
      }).catch((error: unknown) => {
        if (!active || request !== sequence) return;
        setBook(null);
        console.warn("Não foi possível carregar o título do livro na barra de navegação.", error);
      });
    };
    load();
    const unsubscribe = subscribeDataChanges((change) => {
      if (change === "books" || change === "series" || change === "universes" || change === "restore") load();
    });
    return () => { active = false; unsubscribe(); };
  }, [bookId]);

  if (pathname === "/library") return libraryCrumbs;
  if (pathname === "/codex") return [{ label: "Códice" }];
  if (pathname === "/books/new") return [{ label: "Biblioteca", href: "/library" }, { label: "Novo livro" }];
  if (pathname.startsWith("/books/")) {
    const bookLabel = currentBook?.title.trim() || "Livro";
    const bookHref = bookId ? `/books/view?bookId=${encodeURIComponent(bookId)}` : undefined;
    if (pathname === "/books/view") return [...ancestors, { label: bookLabel }];
    const subLabel = subPages[pathname];
    return [
      ...ancestors,
      { label: bookLabel, href: bookHref },
      ...(pathname === "/books/versions" && bookId && chapterId ? [{
        label: "Editor",
        href: `/books/editor?bookId=${encodeURIComponent(bookId)}&chapterId=${encodeURIComponent(chapterId)}`,
      }] : []),
      ...(subLabel ? [{ label: subLabel }] : []),
    ];
  }
  if (pathname === "/settings") return [{ label: "Configurações" }];
  return [];
}

