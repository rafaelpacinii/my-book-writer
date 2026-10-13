"use client";

import { useSearchParams } from "next/navigation";
import { Main } from "@/components/books/versions/Main";

export function VersionsContent() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get("bookId") || "";
  const chapterId = searchParams.get("chapterId") || "";
  const versionId = searchParams.get("versionId") || undefined;

  return <Main bookId={bookId} chapterId={chapterId} initialVersionId={versionId} />;
}

