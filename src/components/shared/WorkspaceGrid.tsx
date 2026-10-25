import type { ReactNode } from "react";

export function WorkspaceGrid({ children }: { children: ReactNode }) {
  return <div className="workspace-grid">{children}</div>;
}
