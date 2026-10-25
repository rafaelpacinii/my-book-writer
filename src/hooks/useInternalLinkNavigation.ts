"use client";

import { useEffect } from "react";
import { HISTORY_NAVIGATION_EVENT } from "@/lib/navigation/requests";

/** Intercept normal in-app link activation while preserving new-tab and download behavior. */
export function useInternalLinkNavigation(enabled: boolean, navigate: (href: string, proceed?: () => void) => void) {
  useEffect(() => {
    if (!enabled) return;
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
      const url = new URL(anchor.href, location.href);
      if (url.protocol !== location.protocol || url.host !== location.host
        || (url.pathname === location.pathname && url.search === location.search)) return;
      event.preventDefault();
      event.stopPropagation();
      navigate(url.pathname + url.search + url.hash);
    };
    document.addEventListener("click", onClick, true);
    const onHistory = (event: Event) => {
      if (!(event instanceof CustomEvent) || typeof event.detail !== "function") return;
      event.preventDefault();
      navigate(location.pathname + location.search, event.detail);
    };
    window.addEventListener(HISTORY_NAVIGATION_EVENT, onHistory);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(HISTORY_NAVIGATION_EVENT, onHistory);
    };
  }, [enabled, navigate]);
}
