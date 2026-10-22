import { LayoutGrid, List } from "lucide-react";

interface Props {
  view: "grid" | "list";
  onChange: (view: "grid" | "list") => void;
}

export function LibraryViewToggle({ view, onChange }: Props) {
  return (
    <div role="group" aria-label="Visualização da biblioteca" className="flex gap-1 border-l border-border pl-2">
      <button type="button" aria-label="Visualizar em grade" aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
        className="rounded p-2 text-muted hover:bg-surface-hover aria-pressed:bg-surface-hover aria-pressed:text-foreground"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button type="button" aria-label="Visualizar em lista" aria-pressed={view === "list"}
        onClick={() => onChange("list")}
        className="rounded p-2 text-muted hover:bg-surface-hover aria-pressed:bg-surface-hover aria-pressed:text-foreground"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
