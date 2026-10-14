import React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatShortcutLabel } from "@/utils/keyboardShortcuts";
import type { EditorShortcuts } from "@/types/settings";

interface Props {
  shortcuts: EditorShortcuts;
  onReset: () => void;
}

const SHORTCUT_LABELS: Array<{ key: keyof EditorShortcuts; label: string; desc: string }> = [
  { key: "save", label: "Salvar capítulo", desc: "Grava as alterações imediatamente no banco" },
  { key: "focusMode", label: "Modo foco", desc: "Oculta barras e menus para imersão" },
  { key: "versionsDrawer", label: "Histórico de versões", desc: "Abre o painel lateral de snapshots" },
  { key: "reviewDrawer", label: "Painel de revisão", desc: "Abre anotações e comentários" },
  { key: "newChapter", label: "Novo capítulo", desc: "Abre o modal rápido para adicionar capítulo" },
];

export function KeyboardShortcutsSection({ shortcuts, onReset }: Props) {
  return (
    <div className="flex flex-col gap-5 max-w-2xl select-none">
      <div className="p-5 rounded-xl border border-border bg-surface flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Atalhos do Editor</h3>
            <p className="text-xs text-muted">Comandos rápidos para aumentar sua produtividade.</p>
          </div>
          <Button variant="outline" onClick={onReset} className="flex items-center gap-1.5 !h-8 text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar padrões</span>
          </Button>
        </div>

        <div className="divide-y divide-border">
          {SHORTCUT_LABELS.map((item) => (
            <div key={item.key} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
              <div>
                <p className="text-xs font-bold text-foreground">{item.label}</p>
                <p className="text-[11px] text-muted">{item.desc}</p>
              </div>
              <kbd className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-border bg-surface-elevated text-foreground shadow-2xs">
                {formatShortcutLabel(shortcuts[item.key])}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

