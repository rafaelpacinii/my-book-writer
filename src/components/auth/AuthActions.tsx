import React from "react";
import { Button } from "@/components/ui/Button";

export interface AuthActionsProps {
  isSignup: boolean;
  onToggleMode: () => void;
  onContinueOffline: () => void;
}

export function AuthActions({
  isSignup,
  onToggleMode,
  onContinueOffline,
}: AuthActionsProps) {
  return (
    <div className="flex flex-col gap-2.5 mt-2">
      <Button
        type="submit"
        variant="primary"
        className="w-full !h-[44px] !text-[13px] !font-bold rounded-[8px]"
      >
        {isSignup ? "Criar conta" : "Entrar"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={onToggleMode}
        className="w-full !h-[44px] !text-[13px] !font-bold"
      >
        {isSignup ? "Já tenho uma conta" : "Ainda não tenho conta"}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={onContinueOffline}
        className="w-full !h-[44px] !text-[13px] !font-bold rounded-[8px] bg-surface border-control-border"
      >
        Continuar offline
      </Button>
    </div>
  );
}
