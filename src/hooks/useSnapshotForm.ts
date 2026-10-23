"use client";

import { useState, type FormEvent } from "react";
import { useHistoryAction } from "@/hooks/useHistoryAction";

export function useSnapshotForm(onCreate: (description?: string) => Promise<void>) {
  const [description, setDescription] = useState("");
  const action = useHistoryAction();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (await action.run(() => onCreate(description.trim() || undefined))) setDescription("");
  };
  return { description, setDescription, submit, ...action };
}
