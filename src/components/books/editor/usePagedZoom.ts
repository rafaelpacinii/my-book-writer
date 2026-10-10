"use client";

import { useLayoutEffect, useState, useEffect, useCallback } from "react";
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

  const changeZoom = useCallback((delta: number) => {
    setZoomScale((prev) => Math.max(0.1, Math.min(2, (isFitMode ? fitScale : prev) + delta)));
    onFitModeChange(false);
  }, [isFitMode, fitScale, onFitModeChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      if (e.key === "+" || e.key === "=" || e.code === "NumpadAdd") {
        e.preventDefault();
        changeZoom(0.15);
      } else if (e.key === "-" || e.key === "_" || e.code === "NumpadSubtract") {
        e.preventDefault();
        changeZoom(-0.15);
      } else if (e.key === "0" || e.code === "Numpad0") {
        e.preventDefault();
        setZoomScale(1);
        onFitModeChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeZoom, onFitModeChange]);

  return {
    scale, isFitMode,
    handleSetFit: () => onFitModeChange(true),
    handleReset100: () => { setZoomScale(1); onFitModeChange(false); },
    handleZoomIn: () => changeZoom(0.15),
    handleZoomOut: () => changeZoom(-0.15),
  };
}
