import type { ReactNode } from "react";

export function PageContent({ children }: { children: ReactNode }) {
  return <div data-page-content className="flex min-w-0 w-full flex-col gap-8 pb-6">{children}</div>;
}
