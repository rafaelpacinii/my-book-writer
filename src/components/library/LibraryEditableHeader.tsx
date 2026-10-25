import type { LibraryCollection } from "@/types/library";
import { useLibraryInlineEdit } from "@/hooks/useLibraryInlineEdit";

interface Props {
  scope: LibraryCollection;
  onSave: (entry: LibraryCollection, name: string, description: string) => Promise<unknown>;
}

export function LibraryEditableHeader({ scope, onSave }: Props) {
  const {
    name,
    description,
    saveStatus,
    handleNameChange,
    handleDescriptionChange,
    flush,
  } = useLibraryInlineEdit({ scope, onSave });

  const isSeries = scope.kind === "series";
  const label = isSeries ? "Série" : "Universo";

  return (
    <div className="min-w-0 flex-1 max-w-2xl">
      <div className="flex items-center gap-2">
        <p className="editorial-eyebrow">{label}</p>
        {saveStatus === "saving" && (
          <span className="text-[10px] text-muted animate-pulse">Salvando…</span>
        )}
        {saveStatus === "saved" && (
          <span className="text-[10px] text-muted">Salvo</span>
        )}
      </div>
      <h1 className="sr-only">{name}</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => handleNameChange(e.target.value)}
        onBlur={flush}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        placeholder={isSeries ? "Nome da série…" : "Nome do universo…"}
        aria-label={isSeries ? "Nome da série" : "Nome do universo"}
        className="editorial-heading mt-1 mb-2 block w-full border-b border-transparent bg-transparent p-0 text-foreground transition-colors placeholder:text-muted/40 hover:border-border/60 focus:border-primary/50 focus:outline-none"
      />
      <textarea
        rows={2}
        value={description}
        onChange={(e) => handleDescriptionChange(e.target.value)}
        onBlur={flush}
        placeholder={isSeries ? "Adicione uma descrição para esta série…" : "Adicione uma descrição para este universo…"}
        aria-label={isSeries ? "Descrição da série" : "Descrição do universo"}
        className="block w-full resize-none border-b border-transparent bg-transparent p-0 text-xs leading-relaxed text-muted transition-colors placeholder:text-muted/40 hover:border-border/60 focus:border-primary/50 focus:outline-none"
      />
    </div>
  );
}

