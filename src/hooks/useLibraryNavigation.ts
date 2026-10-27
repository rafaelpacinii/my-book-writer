"use client";

import { useState } from "react";

export function useLibraryNavigation() {
  const [isOpen, setOpen] = useState(false);
  return { isOpen, toggle: () => setOpen((open) => !open) };
}
