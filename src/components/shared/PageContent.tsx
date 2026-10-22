import type { ReactNode } from "react";

export function PageContent({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-[1390px] flex-col gap-8 pb-6">{children}</div>;
}
