"use client";

import { useSearchParams } from "next/navigation";
import { Main } from "./Main";

export function ExportContent() {
  const searchParams = useSearchParams();
  return <Main bookId={searchParams.get("bookId") ?? ""} />;
}
