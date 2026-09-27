import React from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chapterTitle: string;
}

export function DeleteChapterModal({
  isOpen,
  onClose,
  onConfirm,
  chapterTitle,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Excluir capítulo">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Tem certeza de que deseja excluir o capítulo{" "}
            <strong className="font-bold">"{chapterTitle}"</strong>? Esta ação
            não pode ser desfeita.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Sim, excluir capítulo
          </Button>
        </div>
      </div>
    </Modal>
  );
}
