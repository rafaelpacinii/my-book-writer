"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
}

export function DiscardChangesModal({ isOpen, onClose, onDiscard }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Descartar alterações?">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-foreground">
          Os dados deste formulário ainda não foram salvos.
        </p>
        <p className="text-xs text-muted">
          Se você sair agora, as alterações feitas não serão mantidas. Você pode continuar editando.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Continuar editando
          </Button>
          <Button type="button" variant="primary" onClick={onDiscard}>
            Descartar e voltar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
