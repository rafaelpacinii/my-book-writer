import type { useLibrary } from "@/hooks/useLibrary";
import { LibraryCreateMenu } from "@/components/library/LibraryCreateMenu";
import { LibraryEditableHeader } from "@/components/library/LibraryEditableHeader";

export function LibraryHeader({ lib }: { lib: ReturnType<typeof useLibrary> }) {
  const scope = lib.scope;
  const scoped = scope.kind === "series" || scope.kind === "universe";

  return (
    <header className={`flex justify-between gap-5 ${scoped ? "flex-col lg:flex-row lg:items-start" : "items-start"}`}>
      {scoped ? (
        <LibraryEditableHeader scope={scope} onSave={lib.updateCollection} />
      ) : (
        <div className="min-w-0">
          <p className="editorial-eyebrow">Suas histórias, seu tempo</p>
          <h1 className="editorial-heading mt-1 mb-2.5">Biblioteca</h1>
          <p className="text-xs leading-relaxed text-muted">Um espaço para tudo o que você ainda vai escrever.</p>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <LibraryCreateMenu lib={lib} />
      </div>
    </header>
  );
}
