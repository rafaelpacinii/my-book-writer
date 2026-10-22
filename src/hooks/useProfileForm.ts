"use client";

import { useState, type FormEvent } from "react";
import { useProfile } from "@/hooks/useProfile";

export function useProfileForm(initialName: string, onClose: () => void) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { updateDisplayName } = useProfile();
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) { setError("Informe seu nome ou pseudônimo."); return; }
    setError(null);
    setIsSaving(true);
    try {
      await updateDisplayName(name.trim());
      onClose();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Não foi possível salvar seu nome.");
    } finally { setIsSaving(false); }
  };
  return { name, setName, error, isSaving, save };
}
