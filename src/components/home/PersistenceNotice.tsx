import React from "react";
import { Check } from "lucide-react";

export function PersistenceNotice() {
  return (
    <div className="flex items-center gap-2.5 mt-8 select-none">
      <Check className="w-4 h-4 text-success shrink-0" strokeWidth={2.5} />
      <p className="text-xs text-muted">
        Seu trabalho é salvo neste dispositivo. Escreva mesmo sem internet.
      </p>
    </div>
  );
}
