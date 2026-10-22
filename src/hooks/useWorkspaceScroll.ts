"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function useWorkspaceScroll() {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return mainRef;
}
