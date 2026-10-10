"use client";

import { useLayoutEffect, useState } from "react";
import type { RefObject } from "react";
import type { PageDimensions } from "@/utils/bookPagination";

export type ZoomMode = "width" | "height" | "custom";

export function usePreviewZoom(
  containerRef: RefObject<HTMLElement | null>,
  dim: PageDimensions,
) {
  const [mode, setMode] = useState<ZoomMode>("height");
  const [widthScale, setWidthScale] = useState(1);
  const [heightScale, setHeightScale] = useState(1);
  const [customScale, setCustomScale] = useState(1);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      const availWidth = Math.max(100, container.clientWidth - 48);
      const availHeight = Math.max(100, container.clientHeight - 48);
      setWidthScale(Math.max(0.25, Math.min(3, availWidth / dim.widthPx)));
      setHeightScale(Math.max(0.25, Math.min(3, availHeight / dim.heightPx)));
    };
    const observer = new ResizeObserver(update);
    observer.observe(container);
    update();
    return () => observer.disconnect();
  }, [containerRef, dim]);

  const scale = mode === "width" ? widthScale : mode === "height" ? heightScale : customScale;

  const changeZoom = (delta: number) => {
    const next = Math.max(0.25, Math.min(3, Math.round((scale + delta) * 10) / 10));
    setCustomScale(next);
    setMode("custom");
  };

  return {
    scale,
    mode,
    scalePercent: Math.round(scale * 100),
    fitWidth: () => setMode("width"),
    fitHeight: () => setMode("height"),
    reset100: () => {
      setCustomScale(1);
      setMode("custom");
    },
    zoomIn: () => changeZoom(0.1),
    zoomOut: () => changeZoom(-0.1),
  };
}
