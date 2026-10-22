"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useModalFocus } from "@/hooks/useModalFocus";

export function useMobileNavigation() {
  const pathname = usePathname();
  const [openedPath, setOpenedPath] = useState<string | null>(null);
  const isOpen = openedPath === pathname;
  const close = useCallback(() => setOpenedPath(null), []);
  const dialogRef = useModalFocus(isOpen, close);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 700px)");
    const onResize = () => { if (media.matches) close(); };
    media.addEventListener("change", onResize);
    return () => media.removeEventListener("change", onResize);
  }, [close]);

  return { isOpen, open: () => setOpenedPath(pathname), close, dialogRef };
}
