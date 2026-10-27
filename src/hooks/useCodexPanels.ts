"use client";

import { useLayoutEffect, useRef, useState } from "react";

export function useCodexPanels(selectedId: string | null, catalogKey: string) {
  const [listFor, setListFor] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const detailRef = useRef<HTMLElement>(null);
  const positions = useRef(new Map<string, number>());
  const listOpen = Boolean(selectedId && listFor === selectedId);
  useLayoutEffect(() => {
    if (!selectedId) detailRef.current?.scrollTo({ top: positions.current.get(catalogKey) ?? 0, behavior: "instant" });
  }, [selectedId, catalogKey]);
  useLayoutEffect(() => {
    if (selectedId) detailRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [selectedId]);
  const rememberScroll = () => {
    if (!selectedId && detailRef.current) positions.current.set(catalogKey, detailRef.current.scrollTop);
  };
  return { listOpen, detailRef, rememberScroll, filtersOpen, toggleFilters: () => setFiltersOpen((open) => !open),
    toggleList: () => setListFor(listOpen ? null : selectedId) };
}
