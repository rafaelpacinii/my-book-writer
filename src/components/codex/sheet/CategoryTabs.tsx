import type { useCodexCategoryTabs } from "@/hooks/useCodexCategoryTabs";
import type { CodexStructureEditor } from "@/hooks/useCodexStructure";

export function CategoryTabs({ editor, tabs }: { editor: CodexStructureEditor; tabs: ReturnType<typeof useCodexCategoryTabs> }) {
  if (!editor.items.length) return null;
  return (
    <div ref={tabs.ref} onKeyDown={tabs.onKeyDown} role="tablist" aria-label="Categorias da ficha" className="library-type-filter mb-5">
      {editor.items.map((category) => (
        <button key={category.key} id={`${tabs.id}-${category.key}`} type="button" role="tab"
          aria-selected={editor.active?.key === category.key} aria-controls={`${tabs.id}-panel`}
          tabIndex={editor.active?.key === category.key ? 0 : -1} onClick={() => editor.select(category.key)} title={category.name}>
          <span className="max-w-44 truncate">{category.name}</span>
        </button>
      ))}
    </div>
  );
}
