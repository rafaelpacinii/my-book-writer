import { LibraryBreadcrumbs } from "@/components/library/LibraryBreadcrumbs";
import { LibraryViewToggle } from "@/components/library/LibraryViewToggle";
import type { useLibrary } from "@/hooks/useLibrary";

export function LibraryResultsBar({ lib }: { lib: ReturnType<typeof useLibrary> }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <h2 className="font-display text-[25px]">Seu acervo <span role="status" aria-live="polite"
          className="text-lg text-muted">({lib.entries.length} {lib.entries.length === 1 ? "item" : "itens"})</span></h2>
        <LibraryBreadcrumbs lib={lib} />
      </div>
      <LibraryViewToggle view={lib.view} onChange={lib.setView} />
    </div>
  );
}
