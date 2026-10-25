import { Suspense, type ReactNode } from "react";
import { CodexWorkspace } from "@/components/codex/CodexWorkspace";
import { RouteLoading } from "@/components/shared/RouteLoading";

export default function CodexLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteLoading />}><CodexWorkspace>{children}</CodexWorkspace></Suspense>;
}
