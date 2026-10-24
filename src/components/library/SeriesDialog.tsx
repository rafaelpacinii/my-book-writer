import { CollectionDialog } from "@/components/library/CollectionDialog";
import type { LibrarySeries } from "@/hooks/useLibrarySeries";

export function SeriesDialog({ manager }: { manager: LibrarySeries }) {
  const dialog = manager.dialog;
  if (!dialog) return null;
  return <CollectionDialog manager={manager} action={dialog.kind} label="série"
    item={dialog.kind === "create" ? undefined : dialog.series} />;
}
