"use client";

import { useSearchParams } from "next/navigation";
import { Main } from "@/components/books/editor/Main";

export function EditorContent() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get("bookId") || "";
  const chapterId = searchParams.get("chapterId") || "";

  return <Main bookId={bookId} chapterId={chapterId} />;
}
