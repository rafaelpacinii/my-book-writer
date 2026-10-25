"use client";

import { useLayoutEffect, useRef, useState } from "react";

export function useCodexPanels(selectedId: string | null) {
  const [listFor, setListFor] = useState<string | null>(null);
  const detailRef = useRef<HTMLElement>(null);
  const listOpen = Boolean(selectedId && listFor === selectedId);
  useLayoutEffect(() => { detailRef.current?.scrollTo({ top: 0, behavior: "instant" }); }, [selectedId]);
  return { listOpen, detailRef, toggleList: () => setListFor(listOpen ? null : selectedId) };
}
