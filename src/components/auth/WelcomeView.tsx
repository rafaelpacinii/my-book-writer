"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

export interface WelcomeViewProps {
  onGoToAuth: () => void;
  onContinueOffline: () => void;
}

export function WelcomeView({ onGoToAuth, onContinueOffline }: WelcomeViewProps) {
  return (
    <div className="flex flex-col w-full max-w-[496px] mx-auto py-8">
      <div>
        <span className="text-[12px] font-bold text-primary tracking-wider uppercase">
          FEITO PARA ESCREVER
        </span>
        <h2 className="font-serif text-[32px] sm:text-[38px] text-foreground font-normal leading-[1.25] mt-3">
          Toda história <br /> começa com espaço.
        </h2>
        <p className="text-muted text-[15px] sm:text-[16px] mt-4 leading-relaxed">
          Escreva no seu ritmo. Seus livros ficam <br className="hidden sm:inline" />
          neste dispositivo.
        </p>
      </div>

      <div className="flex flex-col gap-3.5 mt-8 sm:mt-12">
        <Button
          type="button"
          variant="primary"
          onClick={onGoToAuth}
          className="w-full !h-[44px] !text-[13px] !font-bold rounded-[8px]"
        >
          Entrar ou criar conta
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onContinueOffline}
          className="w-full !h-[44px] !text-[13px] !font-bold rounded-[8px] bg-surface border-control-border"
        >
          Continuar offline
        </Button>

        <p className="text-[13px] text-muted text-center sm:text-left mt-2">
          Você pode conectar uma conta depois.
        </p>
      </div>
    </div>
  );
}
