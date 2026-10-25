import type { useLibrary } from "@/hooks/useLibrary";
import { LibraryCreateMenu } from "@/components/library/LibraryCreateMenu";
import { LibraryEditableHeader } from "@/components/library/LibraryEditableHeader";
import { PageHeader } from "@/components/shared/PageHeader";

export function LibraryHeader({ lib }: { lib: ReturnType<typeof useLibrary> }) {
  const scope = lib.scope;
  const scoped = scope.kind === "series" || scope.kind === "universe";
  const actions = <LibraryCreateMenu lib={lib} />;

  if (!scoped) return (
    <PageHeader title="Biblioteca" eyebrow="Suas histórias, seu tempo"
      description="Um espaço para tudo o que você ainda vai escrever." actions={actions} />
  );

  return (
    <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
      <LibraryEditableHeader scope={scope} onSave={lib.updateCollection} />
      <div className="flex flex-wrap items-center gap-2">
        {actions}
      </div>
    </header>
  );
}
