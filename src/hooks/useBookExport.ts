"use client";

import { useEffect, useRef, useState } from "react";
import { exportBookDocx, exportBookEpub, exportBookPdf, getPdfExportInfo } from "@/lib/api/exports";
import { useExportInfo } from "@/hooks/useExportInfo";
import { exportError, exportUnavailable } from "@/utils/bookExport";
import type { ExportFormat, PdfExportResult } from "@/types/export";

const exporters = { pdf: exportBookPdf, epub: exportBookEpub, docx: exportBookDocx };

export function useBookExport(bookId: string) {
  const data = useExportInfo(bookId);
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [pendingFormat, setPendingFormat] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PdfExportResult | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const running = useRef(false);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const exportBook = async () => {
    if (running.current || data.isLoading || !data.info || exportUnavailable(data.info, format)) return;
    running.current = true;
    setPendingFormat(format);
    setError(null);
    setResult(null);
    setCancelled(false);
    try {
      const current = await getPdfExportInfo(bookId);
      if (!mounted.current) return;
      data.setInfo(current);
      const reason = exportUnavailable(current, format);
      if (reason) { setError(reason); return; }
      const saved = await exporters[format](bookId);
      if (mounted.current) { setResult(saved); setCancelled(saved === null); }
    } catch (cause: unknown) {
      if (mounted.current) setError(exportError(cause));
    } finally {
      running.current = false;
      if (mounted.current) setPendingFormat(null);
    }
  };

  const reload = () => { setResult(null); setError(null); setCancelled(false); data.reload(); };
  return { ...data, error: data.error ?? error, loadError: data.error, format, setFormat,
    pendingFormat, isExporting: pendingFormat !== null, result, cancelled, exportBook, reload };
}
