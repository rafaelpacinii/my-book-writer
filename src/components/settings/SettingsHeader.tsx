import React from "react";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";

export function SettingsHeader() {
  return (
    <div className="flex items-center justify-between pb-6 border-b border-border select-none">
      <div className="flex items-center gap-3">
        <Link
          href="/home"
          className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
          title="Voltar ao início"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary-soft text-primary">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Configurações Globais
            </h1>
            <p className="text-xs text-muted">
              Backup do SQLite, comportamento de salvamento e atalhos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

