import { Plus, Save, Undo2, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ActionPopover } from "@/components/shared/ActionPopover";
import type { CodexStructureEditor } from "@/hooks/useCodexStructure";
import styles from "@/components/codex/sheet/dossier.module.css";

export function StructureToolbar({ editor }: { editor: CodexStructureEditor }) {
  return (
    <div className={styles.structureToolbar}>
      <h2 className="text-sm font-bold">Dados da ficha</h2>
      <div className="flex flex-wrap items-center gap-2">
        {!editor.readOnly && <>
          <Button variant="outline" disabled={editor.busy || editor.items.length >= 64} onClick={() => editor.open({ kind: "category" })}>
            <Plus size={16} aria-hidden="true" />Nova categoria
          </Button>
          <Button onClick={() => void editor.save()} disabled={!editor.dirty} isLoading={editor.busy} loadingLabel="Salvando campos…">
            <Save size={16} aria-hidden="true" />Salvar campos
          </Button>
        </>}
        <ActionPopover label="Opções da ficha">
          <Button variant="ghost" disabled={editor.dirty || editor.busy || Boolean(editor.error)} onClick={editor.openTemplate}>
            <Copy size={16} aria-hidden="true" />Salvar como modelo
          </Button>
          {!editor.readOnly && <Button variant="ghost" disabled={!editor.dirty || editor.busy}
            onClick={() => editor.askRemove({ kind: "reset" })}>
            <Undo2 size={16} aria-hidden="true" />Descartar alterações nos campos
          </Button>}
        </ActionPopover>
      </div>
    </div>
  );
}
