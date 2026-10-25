import type { useLibrary } from "@/hooks/useLibrary";
import { LibraryEditableHeader } from "@/components/library/LibraryEditableHeader";
import { PageHeader } from "@/components/shared/PageHeader";

export function LibraryHeader({ lib }: { lib: ReturnType<typeof useLibrary> }) {
  const scope = lib.scope;
  const scoped = scope.kind === "series" || scope.kind === "universe";

  if (!scoped) return (
    <PageHeader title="Biblioteca" eyebrow="Suas histórias, seu tempo"
      description="Um espaço para tudo o que você ainda vai escrever." />
  );

  return (
    <PageHeader title={scope.collection.name} description={scope.collection.description ?? ""}
      content={<LibraryEditableHeader scope={scope} onSave={lib.updateCollection} />} />
  );
}
