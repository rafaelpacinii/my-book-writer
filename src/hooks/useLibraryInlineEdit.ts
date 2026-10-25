"use client";

import { useEffect, useRef, useState } from "react";
import type { LibraryCollection } from "@/types/library";

interface Options {
  scope: LibraryCollection;
  onSave: (entry: LibraryCollection, name: string, description: string) => Promise<unknown>;
  debounceMs?: number;
}

export function useLibraryInlineEdit({ scope, onSave, debounceMs = 1500 }: Options) {
  const [name, setName] = useState(scope.collection.name);
  const [description, setDescription] = useState(scope.collection.description ?? "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const lastSavedRef = useRef({
    id: scope.collection.id,
    name: scope.collection.name,
    description: scope.collection.description ?? "",
  });

  const stateRef = useRef({ name, description });
  stateRef.current = { name, description };

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const scopeRef = useRef(scope);
  scopeRef.current = scope;

  useEffect(() => {
    if (lastSavedRef.current.id !== scope.collection.id) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setName(scope.collection.name);
      setDescription(scope.collection.description ?? "");
      lastSavedRef.current = {
        id: scope.collection.id,
        name: scope.collection.name,
        description: scope.collection.description ?? "",
      };
      setSaveStatus("idle");
    }
  }, [scope.collection.id, scope.collection.name, scope.collection.description]);

  useEffect(() => {
    const isDirty =
      stateRef.current.name !== lastSavedRef.current.name ||
      stateRef.current.description !== lastSavedRef.current.description;

    if (!isDirty && lastSavedRef.current.id === scope.collection.id) {
      setName(scope.collection.name);
      setDescription(scope.collection.description ?? "");
      lastSavedRef.current = {
        id: scope.collection.id,
        name: scope.collection.name,
        description: scope.collection.description ?? "",
      };
    }
  }, [scope.collection.id, scope.collection.name, scope.collection.description]);

  const save = async (nextName: string, nextDesc: string) => {
    const trimmedName = nextName.trim();
    if (!trimmedName) return;
    if (
      trimmedName === lastSavedRef.current.name &&
      nextDesc.trim() === lastSavedRef.current.description.trim()
    ) {
      return;
    }

    setSaveStatus("saving");
    try {
      await onSaveRef.current(scopeRef.current, trimmedName, nextDesc.trim());
      lastSavedRef.current = {
        id: scopeRef.current.collection.id,
        name: trimmedName,
        description: nextDesc.trim(),
      };
      setSaveStatus("saved");
    } catch {
      setSaveStatus("idle");
    }
  };

  const scheduleSave = (nextName: string, nextDesc: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void save(nextName, nextDesc);
    }, debounceMs);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    scheduleSave(val, stateRef.current.description);
  };

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    scheduleSave(stateRef.current.name, val);
  };

  const flush = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    void save(stateRef.current.name, stateRef.current.description);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    name,
    description,
    saveStatus,
    handleNameChange,
    handleDescriptionChange,
    flush,
  };
}

