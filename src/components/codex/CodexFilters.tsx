import { BookOpen, MapPin, Orbit, Search, Sparkles, UserRound } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { codexLabels, contextKey } from "@/utils/codexHub";
import type { CodexHub } from "@/hooks/useCodexHub";
import { useCodexTabs } from "@/hooks/useCodexTabs";

const tabs = [{ kind: "character", icon: UserRound }, { kind: "location", icon: MapPin }, { kind: "lore", icon: Sparkles }] as const;
export function CodexFilters({ hub }: { hub: CodexHub }) {
  const tabsNavigation = useCodexTabs(hub.chooseKind);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Select label="Universo ou livro" icon={hub.context?.kind === "book" ? BookOpen : Orbit}
          value={hub.context ? contextKey(hub.context) : ""} disabled={hub.contexts.length === 0}
          containerClassName="max-w-md" onChange={(event) => hub.chooseContext(event.target.value)}>
          <option value="" disabled>Escolha um Universo ou Livro</option>
          {(["universe", "book"] as const).map((kind) => (
            <optgroup key={kind} label={kind === "universe" ? "Universos" : "Livros avulsos"}>
              {hub.contexts.filter((item) => item.kind === kind).map((context) => (
                <option key={context.id} value={contextKey(context)}>
                  {context.name}{context.is_archived ? " (arquivado)" : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
        <label className="library-search flex-1">
          <Search aria-hidden="true" size={16} />
          <input type="search" aria-label="Buscar fichas" placeholder="Buscar por nome, papel ou tag…"
            value={hub.search} onChange={(event) => hub.setSearch(event.target.value)} />
        </label>
      </div>
      <div ref={tabsNavigation.ref} onKeyDown={tabsNavigation.onKeyDown} role="tablist" aria-label="Tipos de ficha"
        className="library-type-filter max-w-full self-start">
        {tabs.map(({ kind, icon: Icon }) => (
          <button key={kind} id={`codex-tab-${kind}`} role="tab" type="button" aria-selected={hub.kind === kind}
            tabIndex={hub.kind === kind ? 0 : -1} aria-controls="codex-panel" onClick={() => hub.chooseKind(kind)}
            disabled={!hub.context}>
            <Icon size={16} aria-hidden="true" /><span>{codexLabels[kind].plural}</span>
            <span className="text-xs tabular-nums">{hub.entities.filter((item) => item.kind === kind).length}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
