import { ArrowLeft, ArrowRight, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ActionPopover } from "@/components/shared/ActionPopover";
import type { CodexStructureEditor } from "@/hooks/useCodexStructure";

export function CategoryActions({ editor }: { editor: CodexStructureEditor }) {
  const active = editor.active;
  if (!active || editor.readOnly) return null;
  const index = editor.items.findIndex((item) => item.key === active.key);
  return (
    <ActionPopover label="Gerenciar categoria">
      <Button variant="ghost" disabled={editor.busy} onClick={() => editor.open({ kind: "category", key: active.key })}>
        <Pencil size={15} aria-hidden="true" />Renomear categoria
      </Button>
      <Button variant="ghost" disabled={editor.busy || index === 0} onClick={() => editor.moveCategory(-1)}>
        <ArrowLeft size={15} aria-hidden="true" />Mover categoria para a esquerda
      </Button>
      <Button variant="ghost" disabled={editor.busy || index === editor.items.length - 1} onClick={() => editor.moveCategory(1)}>
        <ArrowRight size={15} aria-hidden="true" />Mover categoria para a direita
      </Button>
      <Button variant="ghost" disabled={editor.busy} onClick={() => editor.askRemove({ kind: "category", key: active.key })}>
        <Trash2 size={15} aria-hidden="true" />Excluir categoria
      </Button>
    </ActionPopover>
  );
}
