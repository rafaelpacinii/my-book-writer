import { Archive } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import type { CodexHub } from "@/hooks/useCodexHub";

export function CodexHeader({ hub }: { hub: CodexHub }) {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Códice" eyebrow="Construção de mundo"
        description="Personagens, lugares e conceitos que dão vida às suas histórias."
      />
      {hub.context?.is_archived && (
        <p className="flex w-full items-center gap-2 rounded-lg bg-surface-hover p-3 text-sm text-muted">
          <Archive size={16} aria-hidden="true" />Códice arquivado. Suas fichas continuam disponíveis para consulta.
        </p>
      )}
    </div>
  );
}
