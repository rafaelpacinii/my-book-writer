import { RotateCcw } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useVersionRestore } from "@/hooks/useVersionRestore";

interface Props {
  versionNumber: number;
  disabled: boolean;
  onRestore: () => Promise<boolean>;
}

export function RestoreVersionButton({ versionNumber, disabled, onRestore }: Props) {
  const restore = useVersionRestore(onRestore);
  return (
    <>
      <Button disabled={disabled} onClick={restore.open}>
        <RotateCcw className="h-4 w-4" />Restaurar versão #{versionNumber}
      </Button>
      <Modal isOpen={restore.isOpen} onClose={restore.close} title={`Restaurar versão #${versionNumber}`}>
        <p className="text-sm text-muted">O texto atual será preservado em uma versão de segurança antes da restauração do conteúdo selecionado.</p>
        {restore.error && <p role="alert" className="mt-4 text-sm text-danger">{restore.error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" disabled={restore.isPending} onClick={restore.close}>Cancelar</Button>
          <Button isLoading={restore.isPending} onClick={() => void restore.confirm()}>Confirmar restauração</Button>
        </div>
      </Modal>
    </>
  );
}
