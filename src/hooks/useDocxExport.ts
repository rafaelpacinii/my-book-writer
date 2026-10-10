"use client";

import { useRef, useState } from "react";
import { exportBookDocx } from "@/lib/api/exports";
import type { DocxExportResult } from "@/types/export";

export function useDocxExport(bookId: string, chapterCount = 0) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DocxExportResult | null>(null);
  const running = useRef(false);

  async function exportDocx() {
    if (running.current || !chapterCount) return;
    running.current = true;
    setIsExporting(true);
    setError(null);
    setResult(null);
    try {
      setResult(await exportBookDocx(bookId));
    } catch (err: unknown) {
      setError(String(err instanceof Error ? err.message : err));
    } finally {
      running.current = false;
      setIsExporting(false);
    }
  }

  return { isExporting, error, result, exportDocx };
}

