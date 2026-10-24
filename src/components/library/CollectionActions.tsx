import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { useBookMenu } from "@/hooks/useBookMenu";
import { collectionHref } from "@/utils/libraryExplorer";
import type { LibraryCollection } from "@/types/library";

interface Props {
  entry: LibraryCollection;
  onEdit: () => void;
  onMove?: () => void;
  onDelete: () => void;
  onOpen: () => void;
  disabled: boolean;
}

export function CollectionActions({ entry, onEdit, onDelete, onOpen, onMove, disabled }: Props) {
  const ref = useBookMenu();
  const label = entry.kind === "series" ? "série" : "universo";
  return (
    <details ref={ref} className="absolute top-2 right-2 z-30">
      <summary aria-label={`Ações de ${entry.collection.name}`} className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded text-muted hover:bg-surface [&::-webkit-details-marker]:hidden">
        <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
      </summary>
      <div className="absolute right-0 mt-1 flex w-44 flex-col rounded-md border border-border bg-surface p-1 text-xs shadow-lg">
        <Link href={collectionHref(entry)} onClick={onOpen} className="rounded p-2.5 hover:bg-surface-hover">Abrir {label}</Link>
        {onMove && <button type="button" disabled={disabled} onClick={onMove}
          className="rounded p-2.5 text-left hover:bg-surface-hover">Mover série</button>}
        <button type="button" disabled={disabled} onClick={onEdit} aria-label={`Editar ${label} ${entry.collection.name}`}
          className="rounded p-2.5 text-left hover:bg-surface-hover">Editar {label}</button>
        <button type="button" disabled={disabled} onClick={onDelete} aria-label={`Excluir ${label} ${entry.collection.name}`}
          className="rounded p-2.5 text-left text-danger hover:bg-surface-hover">Excluir {label}</button>
      </div>
    </details>
  );
}
