import { createContext } from "react";

export const SheetDirtyContext = createContext<((key: string, dirty: boolean) => void) | null>(null);
export const SheetNavigationContext = createContext<((href: string) => void) | null>(null);
