"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getBookById } from "@/lib/api/books";
import { subscribeDataChanges } from "@/lib/data/changes";

export interface TitleBarCrumb {
  label: string;
  href?: string;
}

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
  const bookId = searchParams.get("bookId") ?? "";
  const chapterId = searchParams.get("chapterId") ?? "";
  const [book, setBook] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!bookId) return;
    let active = true;
    let sequence = 0;
    const load = () => {
      const request = ++sequence;
      void getBookById(bookId).then((loaded) => {
        if (active && request === sequence) setBook({ id: bookId, title: loaded?.title ?? "" });
      }).catch((error: unknown) => {
        if (!active || request !== sequence) return;
        setBook(null);
        console.warn("Não foi possível carregar o título do livro na barra de navegação.", error);
      });
    };
    load();
    const unsubscribe = subscribeDataChanges((change) => {
      if (change === "books" || change === "restore") load();
    });
    return () => { active = false; unsubscribe(); };
  }, [bookId]);

  if (pathname === "/library") return [{ label: "Biblioteca" }];
  if (pathname === "/books/new") return [{ label: "Biblioteca", href: "/library" }, { label: "Novo livro" }];
  if (pathname.startsWith("/books/")) {
    const bookLabel = (book?.id === bookId ? book.title.trim() : "") || "Livro";
    const bookHref = bookId ? `/books/view?bookId=${encodeURIComponent(bookId)}` : undefined;
    if (pathname === "/books/view") return [{ label: "Biblioteca", href: "/library" }, { label: bookLabel }];
    const subLabel = subPages[pathname];
    return [
      { label: "Biblioteca", href: "/library" },
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

