import React from "react";
import { Input } from "@/components/ui/Input";

export interface AuthFieldsProps {
  isSignup: boolean;
}

export function AuthFields({ isSignup }: AuthFieldsProps) {
  return (
    <>
      {isSignup && (
        <Input
          label="Como você quer ser chamado?"
          placeholder="Ex: Helena Duarte"
          required
        />
      )}
      <Input
        label="E-mail"
        type="email"
        placeholder="helena@exemplo.com"
        required
      />
      <Input
        label="Senha"
        type="password"
        placeholder="••••••••••••"
        required
      />
      {isSignup && (
        <Input
          label="Confirmar senha"
          type="password"
          placeholder="••••••••••••"
          required
        />
      )}
    </>
  );
}
