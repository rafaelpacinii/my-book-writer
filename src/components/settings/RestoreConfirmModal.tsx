import React from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isRestoring: boolean;
}

export function RestoreConfirmModal({ isOpen, onClose, onConfirm, isRestoring }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Restaurar backup dos seus livros">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong className="font-bold">Atenção:</strong> Ao restaurar um backup, os dados atuais deste dispositivo serão substituídos pelos dados do arquivo selecionado. Uma cópia de segurança de emergência será gerada automaticamente.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isRestoring}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isRestoring} loadingLabel="Restaurando backup…">
            {isRestoring ? "Restaurando..." : "Selecionar arquivo e restaurar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

