"use client";

import { useEffect, useRef, useState } from "react";
import { exportBookPdf, getPdfExportInfo } from "@/lib/api/exports";
import type { PdfExportInfo, PdfExportResult } from "@/types/export";

export function usePdfExport(bookId: string) {
  const [info, setInfo] = useState<PdfExportInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PdfExportResult | null>(null);
  const running = useRef(false);

  useEffect(() => {
    let active = true;
    setInfo(null);
    setResult(null);
    setError(null);
    setIsLoading(true);
    getPdfExportInfo(bookId).then((loaded) => {
      if (active) setInfo(loaded);
    }).catch((error: unknown) => {
      if (active) setError(String(error instanceof Error ? error.message : error));
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, [bookId]);

  async function exportPdf() {
    if (running.current || !info?.available || !info.chapter_count) return;
    running.current = true;
    setIsExporting(true);
    setError(null);
    setResult(null);
    try {
      setResult(await exportBookPdf(bookId));
    } catch (error: unknown) {
      setError(String(error instanceof Error ? error.message : error));
    } finally {
      running.current = false;
      setIsExporting(false);
    }
  }

  return { info, isLoading, isExporting, error, result, exportPdf };
}
