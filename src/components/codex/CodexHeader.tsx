import { Archive, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CodexHub } from "@/hooks/useCodexHub";

export function CodexHeader({ hub }: { hub: CodexHub }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Construção de mundo</p>
        <h1 className="text-3xl font-bold text-foreground">Códice</h1>
        <p className="mt-2 text-sm text-muted">Personagens, lugares e conceitos que dão vida às suas histórias.</p>
        {hub.context && <p className="mt-3 break-words text-sm font-semibold text-foreground">{hub.context.name}</p>}
      </div>
      <Button type="button" disabled={!hub.canCreate || hub.isLoading} onClick={() => hub.setCreating(true)}>
        <Plus aria-hidden="true" size={18} />Nova ficha
      </Button>
      {hub.context?.is_archived && (
        <p className="flex w-full items-center gap-2 rounded-lg bg-surface-hover p-3 text-sm text-muted">
          <Archive size={16} aria-hidden="true" />Códice arquivado. Suas fichas continuam disponíveis para consulta.
        </p>
      )}
    </header>
  );
}
