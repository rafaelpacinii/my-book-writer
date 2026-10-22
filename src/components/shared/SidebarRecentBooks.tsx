"use client";

import Link from "next/link";
import { useBooks } from "@/hooks/useBooks";
import { useProfile } from "@/hooks/useProfile";

export function SidebarRecentBooks({ onNavigate }: { onNavigate: () => void }) {
  const { profile } = useProfile();
  const { books } = useBooks(profile?.id);
  const recent = [...books].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 3);

  if (!recent.length) return null;
  return (
    <section aria-label="Livros recentes" className="sidebar-recent mt-1 mb-2 ml-[23px] border-l border-border pl-3">
      <h2 className="sr-only">Livros recentes</h2>
      <ul className="space-y-0.5">
        {recent.map((book) => (
          <li key={book.id} className="sidebar-book-branch relative">
            <Link href={`/books/view?bookId=${encodeURIComponent(book.id)}`} onClick={onNavigate}
              className="block truncate rounded-md px-3 py-2.5 text-[11px] text-muted hover:bg-surface-hover hover:text-foreground"
            >
              {book.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
