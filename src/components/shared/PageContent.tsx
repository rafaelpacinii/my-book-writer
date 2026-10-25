import type { ReactNode } from "react";

export function PageContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div data-page-content className={`flex min-w-0 w-full flex-col gap-8 pb-6 ${className}`}>{children}</div>;
}
