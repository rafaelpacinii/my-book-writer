"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  bookTitle: string;
  isDeleting: boolean;
}

export function DeleteBookModal(props: Props) {
  const { isOpen, onClose, onConfirm, bookTitle, isDeleting } = props;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Excluir livro?">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-foreground">
          Tem certeza de que deseja excluir <span className="font-bold">"{bookTitle}"</span>?
        </p>
        <p className="text-xs text-muted">
          Esta ação moverá o livro para a lixeira deste dispositivo e removerá seus capítulos da biblioteca.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={isDeleting}
            onClick={onConfirm}
          >
            Sim, excluir livro
          </Button>
        </div>
      </div>
    </Modal>
  );
}
