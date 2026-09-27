import React from "react";

export function PersistenceNotice() {
  return (
    <div className="flex items-center gap-2.5 mt-8 select-none">
      <svg
        className="w-4 h-4 text-success shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l4 4L19 6" />
      </svg>
      <p className="text-xs text-muted">
        Seu trabalho é salvo neste dispositivo. Escreva mesmo sem internet.
      </p>
    </div>
  );
}
