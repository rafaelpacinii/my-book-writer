"use client";

import { useSearchParams } from "next/navigation";
import { Main } from "@/components/books/preview/Main";

export function PreviewContent() {
  const bookId = useSearchParams().get("bookId") ?? "";
  return <Main bookId={bookId} />;
}

