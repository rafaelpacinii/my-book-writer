"use client";

import { useSearchParams } from "next/navigation";
import { Main } from "./Main";

export function ExportContent() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get("bookId") ?? "";
  return <Main key={bookId} bookId={bookId} />;
}
