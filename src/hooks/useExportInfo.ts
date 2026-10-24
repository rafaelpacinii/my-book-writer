"use client";

import { useCallback, useEffect, useState } from "react";
import { getPdfExportInfo } from "@/lib/api/exports";
import { exportError } from "@/utils/bookExport";
import type { PdfExportInfo } from "@/types/export";

export function useExportInfo(bookId: string) {
  const [info, setInfo] = useState<PdfExportInfo | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    setInfo(null);
    setError(null);
    setLoading(true);
    void getPdfExportInfo(bookId).then((loaded) => {
      if (active) setInfo(loaded);
    }).catch((cause: unknown) => {
      if (active) setError(exportError(cause));
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [bookId, attempt]);

  return { info, setInfo, isLoading, error, reload };
}
