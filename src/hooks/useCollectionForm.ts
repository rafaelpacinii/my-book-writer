"use client";

import { useState, type FormEvent } from "react";
import type { BookSeries } from "@/types/series";

export function useCollectionForm(series: Pick<BookSeries, "name" | "description"> | undefined, onSave: (name: string, description: string) => Promise<void>, label: string) {
  const [name, setName] = useState(series?.name ?? "");
  const [description, setDescription] = useState(series?.description ?? "");
  const [error, setError] = useState<string>();
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) { setError(`O nome ${label === "série" ? "da série" : "do universo"} é obrigatório.`); return; }
    setError(undefined);
    await onSave(name.trim(), description.trim());
  }
  return { name, setName, description, setDescription, error, submit };
}
