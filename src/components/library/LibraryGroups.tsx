import { LibraryEntryGrid } from "@/components/library/LibraryEntryGrid";
import type { useLibrary } from "@/hooks/useLibrary";

const categories = [
  { kind: "universe", label: "Universos" },
  { kind: "series", label: "Séries" },
  { kind: "book", label: "Livros avulsos" },
] as const;

export function LibraryGroups({ lib }: { lib: ReturnType<typeof useLibrary> }) {
  if (lib.grouping === "mixed") return <LibraryEntryGrid entries={lib.entries} lib={lib} />;
  return (
    <div className="flex flex-col gap-8">
      {categories.map(({ kind, label }) => {
        const entries = lib.entries.filter((entry) => entry.kind === kind);
        if (!entries.length) return null;
        return (
          <section key={kind} aria-label={label}>
            <h3 className="mb-4 font-display text-2xl">{label}</h3>
            <LibraryEntryGrid entries={entries} lib={lib} />
          </section>
        );
      })}
    </div>
  );
}
