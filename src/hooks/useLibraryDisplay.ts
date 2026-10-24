"use client";

import { useLayoutEffect, useState } from "react";
import type { LibraryGrouping } from "@/types/library";

const key = "mbw_library_display";

export function useLibraryDisplay() {
  const [grouping, setGrouping] = useState<LibraryGrouping>("mixed");
  const [view, setView] = useState<"grid" | "list">("grid");
  useLayoutEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
      if (!stored || typeof stored !== "object") return;
      if ("grouping" in stored && stored.grouping === "type") setGrouping("type");
      if ("view" in stored && stored.view === "list") setView("list");
    } catch (error) { console.warn("Não foi possível ler a exibição da biblioteca.", error); }
  }, []);

  function save(nextGrouping: LibraryGrouping, nextView: "grid" | "list") {
    setGrouping(nextGrouping);
    setView(nextView);
    try { localStorage.setItem(key, JSON.stringify({ grouping: nextGrouping, view: nextView })); }
    catch (error) { console.warn("A exibição da biblioteca não será preservada ao reiniciar.", error); }
  }
  return {
    grouping, view,
    setGrouping: (next: LibraryGrouping) => save(next, view),
    setView: (next: "grid" | "list") => save(grouping, next),
  };
}
