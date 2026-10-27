import { BookOpen, Layers, Library, Orbit } from "lucide-react";
import type { LibraryTypeFilter as TypeFilter } from "@/types/library";
import { libraryTypeIsAvailable } from "@/utils/libraryTypeFilter";

const choices = [
  { value: "all", label: "Todos", icon: Library },
  { value: "book", label: "Livros", icon: BookOpen },
  { value: "series", label: "Séries", icon: Layers },
  { value: "universe", label: "Universos", icon: Orbit },
] as const;

export function LibraryTypeFilter({ value, onChange, scopeKind }: {
  value: TypeFilter; onChange: (value: TypeFilter) => void; scopeKind: "root" | "universe" | "series" | "missing";
}) {
  return (
    <div role="group" aria-label="Filtrar por tipo" className="library-type-filter">
      {choices.map(({ value: type, label, icon: Icon }) => (
        <button key={type} type="button" aria-pressed={value === type} onClick={() => onChange(type)}
          disabled={!libraryTypeIsAvailable(type, scopeKind)}>
          <Icon size={15} aria-hidden="true" /><span>{label}</span>
        </button>
      ))}
    </div>
  );
}
