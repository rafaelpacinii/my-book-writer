"use client";

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OfflineProfileHeader } from "./OfflineProfileHeader";

interface Props {
  onBack: () => void;
  onSubmit: (name: string) => void;
  isLoading?: boolean;
}

export function OfflineProfileView({ onBack, onSubmit, isLoading }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Informe seu nome ou pseudônimo de autor.");
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <div className="flex flex-col w-full max-w-[496px] mx-auto py-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 self-start text-[13px] font-bold text-foreground hover:text-primary transition-colors cursor-pointer mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar</span>
      </button>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <OfflineProfileHeader />

        <Input
          label="Nome ou pseudônimo de autor"
          placeholder="Ex: Helena Duarte"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(null); }}
          error={error ?? undefined}
          autoFocus
        />

        <div className="flex flex-col gap-3 mt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="w-full !h-[44px] !text-[13px] !font-bold rounded-[8px]"
          >
            {isLoading ? "Salvando..." : "Começar a escrever"}
          </Button>

          <p className="text-xs text-muted text-center mt-1">
            Seus livros e perfil ficam salvos apenas neste dispositivo.
          </p>
        </div>
      </form>
    </div>
  );
}
