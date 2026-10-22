"use client";

import { useId, useState } from "react";

export function useSidebarNavigation() {
  const collectionId = useId();
  const [isCollectionOpen, setIsCollectionOpen] = useState(true);
  return { collectionId, isCollectionOpen, toggleCollection: () => setIsCollectionOpen((value) => !value) };
}
