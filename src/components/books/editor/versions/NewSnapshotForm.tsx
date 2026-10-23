import React from "react";
import { useSnapshotForm } from "@/hooks/useSnapshotForm";
import { Camera, Plus } from "lucide-react";

interface Props {
  onCreate: (description?: string) => Promise<void>;
}

export function NewSnapshotForm({ onCreate }: Props) {
  const form = useSnapshotForm(onCreate);

  return (
    <form onSubmit={form.submit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          aria-label="Rótulo da versão"
          disabled={form.isPending}
          type="text"
          value={form.description}
          onChange={(e) => form.setDescription(e.target.value)}
          placeholder="Rótulo da versão (opcional)..."
          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-control-border bg-surface text-foreground placeholder:text-muted outline-none focus:border-primary"
        />
        <button
          type="submit"
          aria-label="Criar novo snapshot"
          disabled={form.isPending}
          className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
          title="Criar novo snapshot"
        >
          {form.isPending ? <Camera className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          <span>Snapshot</span>
        </button>
      </div>
      {form.error && <p role="alert" className="text-xs text-danger">{form.error}</p>}
    </form>
  );
}
