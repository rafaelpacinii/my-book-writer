import { LayoutGrid, List } from "lucide-react";

interface Props {
  view: "grid" | "list";
  onChange: (view: "grid" | "list") => void;
  label?: string;
}

export function LibraryViewToggle({ view, onChange, label = "Visualização da biblioteca" }: Props) {
  return (
    <div role="group" aria-label={label} className="library-view-toggle">
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
