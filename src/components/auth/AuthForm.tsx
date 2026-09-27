"use client";

import React, { useState } from "react";
import { AuthFields } from "./AuthFields";
import { AuthActions } from "./AuthActions";

export interface AuthFormProps {
  onBack: () => void;
  onContinueOffline: () => void;
}

export function AuthForm({ onBack, onContinueOffline }: AuthFormProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice("Sincronização em nuvem em preparação. Use 'Continuar offline' para salvar localmente.");
  };

  return (
    <div className="flex flex-col w-full max-w-[496px] mx-auto py-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 self-start text-[13px] font-bold text-foreground hover:text-primary transition-colors cursor-pointer mb-6"
      >
        ← Voltar
      </button>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <h2 className="font-serif text-[28px] sm:text-[30px] text-foreground font-normal">
            {isSignup ? "Sua próxima história." : "Bom ter você por aqui."}
          </h2>
          <p className="text-muted text-[15px] sm:text-[16px] mt-1.5">
            {isSignup ? "Crie uma conta para conectar seu espaço." : "Entre na sua conta para continuar."}
          </p>
        </div>

        {notice && (
          <div className="p-3.5 rounded-[8px] bg-warning-soft border border-warning/30 text-[13px] text-warning">
            {notice}
          </div>
        )}

        <AuthFields isSignup={isSignup} />

        <AuthActions
          isSignup={isSignup}
          onToggleMode={() => {
            setIsSignup((v) => !v);
            setNotice(null);
          }}
          onContinueOffline={onContinueOffline}
        />
      </form>
    </div>
  );
}
