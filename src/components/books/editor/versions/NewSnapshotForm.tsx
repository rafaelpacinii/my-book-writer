import React, { useState } from "react";
import { Camera, Plus } from "lucide-react";

interface Props {
  onCreate: (description?: string) => Promise<void>;
}

export function NewSnapshotForm({ onCreate }: Props) {
  const [desc, setDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreate(desc.trim() || undefined);
      setDesc("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Rótulo da versão (opcional)..."
          className="flex-1 px-3 py-1.5 text-xs rounded-md border border-control-border bg-surface text-foreground placeholder:text-muted outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-3 py-1.5 rounded-md bg-primary hover:bg-primary-hover text-surface text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
          title="Criar novo snapshot"
        >
          {isSubmitting ? <Camera className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          <span>Snapshot</span>
        </button>
      </div>
    </form>
  );
}

