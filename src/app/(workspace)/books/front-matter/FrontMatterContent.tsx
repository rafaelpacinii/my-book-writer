"use client";

import { useSearchParams } from "next/navigation";
import { Main } from "@/components/books/frontMatter/Main";

export function FrontMatterContent() {
  const params = useSearchParams();
  return <Main bookId={params.get("bookId") || params.get("id") || ""} />;
}
