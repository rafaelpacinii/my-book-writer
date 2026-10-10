"use client";

import { useRef, useState } from "react";
import { exportBookEpub } from "@/lib/api/exports";
import type { EpubExportResult } from "@/types/export";

export function useEpubExport(bookId: string, chapterCount = 0) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EpubExportResult | null>(null);
  const running = useRef(false);

  async function exportEpub() {
    if (running.current || !chapterCount) return;
    running.current = true;
    setIsExporting(true);
    setError(null);
    setResult(null);
    try {
      setResult(await exportBookEpub(bookId));
    } catch (err: unknown) {
      setError(String(err instanceof Error ? err.message : err));
    } finally {
      running.current = false;
      setIsExporting(false);
    }
  }

  return { isExporting, error, result, exportEpub };
}

