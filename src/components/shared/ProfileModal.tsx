"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useProfile } from "@/hooks/useProfile";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: Props) {
  const { profile, updateDisplayName } = useProfile();
  const [name, setName] = useState(profile?.display_name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await updateDisplayName(name.trim());
      setSavedNotice(true);
      setTimeout(() => {
        setSavedNotice(false);
        onClose();
      }, 700);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurações do Autor">
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <Input
          label="Nome ou pseudônimo de autor"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Helena Duarte"
        />

        <div className="p-3 rounded-lg bg-surface border border-border text-xs text-muted">
          <p className="font-semibold text-foreground mb-0.5">Modo Local-First</p>
          Seus livros e perfil estão armazenados com segurança neste dispositivo.
        </div>

        {savedNotice && (
          <p className="text-xs font-bold text-success text-center">
            Nome atualizado com sucesso!
          </p>
        )}

        <div className="flex items-center justify-end gap-2.5 mt-2">
          <Button type="button" variant="outline" onClick={onClose} className="!h-9 text-xs">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving} className="!h-9 text-xs">
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
