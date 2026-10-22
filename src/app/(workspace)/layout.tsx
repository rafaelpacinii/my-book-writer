import type { ReactNode } from "react";
import { AppShell } from "@/components/shared/AppShell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
