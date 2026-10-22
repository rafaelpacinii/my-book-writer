"use client";

import type { ReactNode } from "react";
import { useAppDataChanges } from "@/hooks/useAppDataChanges";

export function AppDataProvider({ children }: { children: ReactNode }) {
  useAppDataChanges();
  return children;
}
