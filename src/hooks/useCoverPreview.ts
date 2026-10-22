"use client";

import { useState, type MouseEvent } from "react";

export function useCoverPreview(coverUrl?: string | null, onCoverChange?: (dataUrl: string | null) => void) {
  const [internalUrl, setInternalUrl] = useState<string | null>(coverUrl ?? null);
  const activeUrl = coverUrl !== undefined ? coverUrl : internalUrl;

  const handleLoaded = (dataUrl: string) => {
    setInternalUrl(dataUrl);
    onCoverChange?.(dataUrl);
  };

  const handleRemove = (event: MouseEvent) => {
    event.stopPropagation();
    setInternalUrl(null);
    onCoverChange?.(null);
  };

  return { activeUrl, handleLoaded, handleRemove };
}
