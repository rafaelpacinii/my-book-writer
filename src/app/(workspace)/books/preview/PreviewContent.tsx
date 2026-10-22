"use client";

import { useSearchParams } from "next/navigation";
import { Main } from "@/components/books/preview/Main";

export function PreviewContent() {
  const params = useSearchParams();
  return <Main bookId={params.get("bookId") ?? ""} chapterId={params.get("chapterId") ?? ""} />;
}

