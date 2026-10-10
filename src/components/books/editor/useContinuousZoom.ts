"use client";

import { useEffect, useState, useCallback } from "react";

export function useContinuousZoom() {
  const [zoomScale, setZoomScale] = useState(1);

  const changeZoom = useCallback((delta: number) => {
    setZoomScale((prev) => {
      const next = Math.round((prev + delta) * 10) / 10;
      return Math.max(0.5, Math.min(2.0, next));
    });
  }, []);

  const resetZoom = useCallback(() => {
    setZoomScale(1);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;

      if (e.key === "+" || e.key === "=" || e.code === "NumpadAdd") {
        e.preventDefault();
        changeZoom(0.1);
      } else if (e.key === "-" || e.key === "_" || e.code === "NumpadSubtract") {
        e.preventDefault();
        changeZoom(-0.1);
      } else if (e.key === "0" || e.code === "Numpad0") {
        e.preventDefault();
        resetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeZoom, resetZoom]);

  return { zoomScale, changeZoom, resetZoom };
}

