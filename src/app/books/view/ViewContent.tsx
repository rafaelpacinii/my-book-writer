"use client";

import { useSearchParams } from "next/navigation";
import { Main } from "@/components/books/detail/Main";

export function ViewContent() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get("bookId") || searchParams.get("id") || "";
  return <Main bookId={bookId} />;
}
