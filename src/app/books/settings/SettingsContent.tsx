"use client";

import { useSearchParams } from "next/navigation";
import { Main } from "@/components/books/settings/Main";

export function SettingsContent() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get("bookId") || searchParams.get("id") || "";
  return <Main bookId={bookId} />;
}
