"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";

export function useProfileDialog() {
  const profile = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  return { ...profile, isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) };
}
