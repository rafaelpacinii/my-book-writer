"use client";

import { useLayoutEffect, useState } from "react";
import type { RefObject } from "react";
import type { PageDimensions } from "@/utils/bookPagination";

export function usePagedZoom(
  containerRef: RefObject<HTMLElement | null>,
  dim: PageDimensions,
  isFitMode: boolean,
  onFitModeChange: (fit: boolean) => void,
) {
  const [fitScale, setFitScale] = useState(1);
  const [zoomScale, setZoomScale] = useState(1);
  const scale = isFitMode ? fitScale : zoomScale;

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      const height = (container.clientHeight - 100) / dim.heightPx;
      const width = (container.clientWidth - 40) / dim.widthPx;
      setFitScale(Math.max(0.1, Math.min(1, height, width)));
    };
    const observer = new ResizeObserver(update);
    observer.observe(container);
    update();
    return () => observer.disconnect();
  }, [containerRef, dim]);

  const changeZoom = (delta: number) => {
    setZoomScale(Math.max(0.1, Math.min(2, scale + delta)));
    onFitModeChange(false);
  };

  return {
    scale, isFitMode,
    handleSetFit: () => onFitModeChange(true),
    handleReset100: () => { setZoomScale(1); onFitModeChange(false); },
    handleZoomIn: () => changeZoom(0.15),
    handleZoomOut: () => changeZoom(-0.15),
  };
}
