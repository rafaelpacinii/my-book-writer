"use client";

import { useState, useSyncExternalStore } from "react";

const query = "(max-width: 1099px)";
const subscribe = (listener: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
};
const getCompact = () => window.matchMedia(query).matches;

export function useEditorChapterSidebar() {
  const compact = useSyncExternalStore(subscribe, getCompact, () => false);
  const [requestedOpen, setIsDrawerOpen] = useState<boolean | null>(null);
  return { isDrawerOpen: requestedOpen ?? !compact, setIsDrawerOpen };
}
