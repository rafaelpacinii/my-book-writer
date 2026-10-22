import type { ReactNode } from "react";
import { PageContent } from "@/components/shared/PageContent";

export function BookSectionPage({ children }: { children: ReactNode }) {
  return <PageContent><div data-book-section className="pb-16">{children}</div></PageContent>;
}

export function BookSectionColumns({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">{children}</div>;
}

export function BookSectionCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-border bg-surface p-6 shadow-xs sm:p-8 ${className}`}>
      {children}
    </section>
  );
}
