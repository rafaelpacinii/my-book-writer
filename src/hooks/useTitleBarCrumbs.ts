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
  const [bookTitle, setBookTitle] = useState("");

  useEffect(() => {
    if (!bookId) { setBookTitle(""); return; }
    let active = true;
    const load = () => {
      void getBookById(bookId).then((book) => {
        if (active && book?.title) setBookTitle(book.title);
      }).catch(() => {});
    };
    load();
    const unsubscribe = subscribeDataChanges(load);
    return () => { active = false; unsubscribe(); };
  }, [bookId]);

  if (pathname === "/library") return [{ label: "Biblioteca" }];
  if (pathname === "/books/new") return [{ label: "Biblioteca", href: "/library" }, { label: "Novo livro" }];
  if (pathname.startsWith("/books/")) {
    const bookLabel = bookTitle.trim() || "Livro";
    const bookHref = bookId ? `/books/view?bookId=${encodeURIComponent(bookId)}` : undefined;
    if (pathname === "/books/view") return [{ label: "Biblioteca", href: "/library" }, { label: bookLabel }];
    const subLabel = subPages[pathname];
    return [
      { label: "Biblioteca", href: "/library" },
      { label: bookLabel, href: bookHref },
      ...(subLabel ? [{ label: subLabel }] : []),
    ];
  }
  if (pathname === "/settings") return [{ label: "Configurações" }];
  return [];
}

