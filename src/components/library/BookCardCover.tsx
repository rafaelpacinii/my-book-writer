"use client";

import React, { useEffect, useState } from "react";
import { loadBookCoverUrl } from "@/lib/api/images";
import { Skeleton } from "@/components/ui/Skeleton";
import { BookCoverArtwork } from "./BookCoverArtwork";

interface Props {
  bookId: string;
  assetId?: string | null;
  title: string;
  index: number;
}

const libraryCoverCache = new Map<string, string>();

export function BookCardCover({ bookId, assetId, title, index }: Props) {
  const cacheKey = `${bookId}-${assetId}`;
  const cached = assetId ? libraryCoverCache.get(cacheKey) || null : null;

  const [coverUrl, setCoverUrl] = useState<string | null>(cached);
  const [isLoaded, setIsLoaded] = useState<boolean>(Boolean(cached));
  const hasAsset = Boolean(assetId);

  useEffect(() => {
    if (!hasAsset) return;
    if (libraryCoverCache.has(cacheKey)) {
      setCoverUrl(libraryCoverCache.get(cacheKey)!);
      setIsLoaded(true);
      return;
    }

    let active = true;
    void loadBookCoverUrl(bookId, assetId).then((url) => {
      if (active && url) {
        libraryCoverCache.set(cacheKey, url);
        setCoverUrl(url);
      }
    });
    return () => { active = false; };
  }, [bookId, assetId, hasAsset, cacheKey]);

  if (!hasAsset) {
    return (
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-surface-hover border-b border-border">
        <BookCoverArtwork index={index} />
      </div>
    );
  }

  return (
    <div className="relative aspect-[3/2] w-full overflow-hidden bg-surface-hover border-b border-border">
      {!isLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-none z-0" />
      )}
      {coverUrl && (
        <img
          src={coverUrl}
          alt={title}
          onLoad={() => setIsLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 z-10 ${
            isLoaded ? "block" : "invisible"
          }`}
        />
      )}
    </div>
  );
}
