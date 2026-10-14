"use client";

import React, { useEffect, useState } from "react";
import { loadBookCoverUrl } from "@/lib/api/images";
import { Skeleton } from "@/components/ui/Skeleton";
import { ContinueArtwork } from "./ContinueArtwork";

interface Props {
  bookId: string;
  assetId?: string | null;
  title: string;
}

const coverCache = new Map<string, string>();

export function ContinueCover({ bookId, assetId, title }: Props) {
  const cacheKey = `${bookId}-${assetId}`;
  const cached = assetId ? coverCache.get(cacheKey) || null : null;

  const [coverUrl, setCoverUrl] = useState<string | null>(cached);
  const [isLoaded, setIsLoaded] = useState<boolean>(Boolean(cached));
  const hasAsset = Boolean(assetId);

  useEffect(() => {
    if (!hasAsset) return;
    if (coverCache.has(cacheKey)) {
      setCoverUrl(coverCache.get(cacheKey)!);
      setIsLoaded(true);
      return;
    }

    let active = true;
    void loadBookCoverUrl(bookId, assetId).then((url) => {
      if (active && url) {
        coverCache.set(cacheKey, url);
        setCoverUrl(url);
      }
    });
    return () => { active = false; };
  }, [bookId, assetId, hasAsset, cacheKey]);

  if (!hasAsset) {
    return (
      <div className="relative w-full md:w-72 lg:w-84 h-56 md:h-auto md:self-stretch shrink-0 overflow-hidden bg-surface-hover">
        <ContinueArtwork />
      </div>
    );
  }

  return (
    <div className="relative w-full md:w-72 lg:w-84 h-56 md:h-auto md:self-stretch shrink-0 overflow-hidden bg-surface-hover">
      {!isLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-none z-0" />
      )}
      {coverUrl && (
        <img
          src={coverUrl}
          alt={title}
          onLoad={() => setIsLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover z-10 ${
            isLoaded ? "block" : "invisible"
          }`}
        />
      )}
    </div>
  );
}
