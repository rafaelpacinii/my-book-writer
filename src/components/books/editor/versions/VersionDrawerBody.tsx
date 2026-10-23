import { ErrorState } from "@/components/shared/ErrorState";
import { TrackChangesToggle } from "./TrackChangesToggle";
import { NewSnapshotForm } from "./NewSnapshotForm";
import { VersionList } from "./VersionList";
import type { VersionDrawerProps } from "./types";

interface Props extends VersionDrawerProps {
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function VersionDrawerBody(props: Props) {
  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      <TrackChangesToggle enabled={props.trackChanges} onToggle={props.onToggleTrackChanges} />
      <NewSnapshotForm onCreate={props.onCreateSnapshot} />
      {props.error && <ErrorState message={props.error} onRetry={() => void props.onRetry()} />}
      {props.isLoading ? (
        <p role="status" className="text-xs text-muted">Carregando versões...</p>
      ) : (
        <VersionList versions={props.versions} onSelect={props.onSelect} onDelete={props.onDelete} />
      )}
    </div>
  );
}
