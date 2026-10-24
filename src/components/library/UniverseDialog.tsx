import { CollectionDialog } from "@/components/library/CollectionDialog";
import type { LibraryUniverses } from "@/hooks/useLibraryUniverses";

export function UniverseDialog({ manager }: { manager: LibraryUniverses }) {
  const dialog = manager.dialog;
  if (!dialog) return null;
  return <CollectionDialog manager={manager} action={dialog.kind} label="universo"
    item={dialog.kind === "create" ? undefined : dialog.universe} />;
}
