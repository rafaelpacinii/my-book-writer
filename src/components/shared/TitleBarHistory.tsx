"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useAppHistory } from "@/hooks/useAppHistory";

export function TitleBarHistory() {
  const navigation = useAppHistory();
  return (
    <div className="titlebar-history" role="group" aria-label="Histórico de navegação">
      <button type="button" className="titlebar-action" aria-label="Voltar" title="Voltar"
        disabled={!navigation.canBack} onClick={navigation.back}>
        <ArrowLeft size={16} aria-hidden="true" />
      </button>
      <button type="button" className="titlebar-action" aria-label="Avançar" title="Avançar"
        disabled={!navigation.canForward} onClick={navigation.forward}>
        <ArrowRight size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
