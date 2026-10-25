import { LayoutGrid, List } from "lucide-react";

interface Props {
  view: "grid" | "list";
  onChange: (view: "grid" | "list") => void;
}

export function LibraryViewToggle({ view, onChange }: Props) {
  return (
    <div role="group" aria-label="Visualização da biblioteca" className="library-view-toggle">
      <button type="button" aria-label="Visualizar em grade" aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button type="button" aria-label="Visualizar em lista" aria-pressed={view === "list"}
        onClick={() => onChange("list")}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
