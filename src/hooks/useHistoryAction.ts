"use client";

import { useEffect, useRef, useState } from "react";
import { historyError } from "@/utils/versionHistory";

export function useHistoryAction(resetKey?: unknown) {
  const lock = useRef(false);
  const [isPending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { setError(null); }, [resetKey]);
  const run = async (action: () => Promise<unknown>): Promise<boolean> => {
    if (lock.current) return false;
    lock.current = true;
    setPending(true);
    setError(null);
    try { await action(); return true; }
    catch (cause) { setError(historyError(cause)); return false; }
    finally { lock.current = false; setPending(false); }
  };
  return { isPending, error, run };
}
