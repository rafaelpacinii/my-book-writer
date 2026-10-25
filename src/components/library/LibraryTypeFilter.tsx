import { BookOpen, Layers, Library, Orbit } from "lucide-react";
import type { LibraryTypeFilter as TypeFilter } from "@/types/library";

const choices = [
  { value: "all", label: "Todos", icon: Library },
  { value: "book", label: "Livros", icon: BookOpen },
  { value: "series", label: "Séries", icon: Layers },
  { value: "universe", label: "Universos", icon: Orbit },
] as const;

export function LibraryTypeFilter({ value, onChange, inUniverse }: {
  value: TypeFilter; onChange: (value: TypeFilter) => void; inUniverse: boolean;
}) {
  return (
    <div role="group" aria-label="Filtrar por tipo" className="library-type-filter">
      {choices.filter((choice) => !inUniverse || choice.value !== "universe").map(({ value: type, label, icon: Icon }) => (
        <button key={type} type="button" aria-pressed={value === type} onClick={() => onChange(type)}>
          <Icon size={15} aria-hidden="true" /><span>{label}</span>
        </button>
      ))}
    </div>
  );
}
