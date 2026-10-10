"use client";

import { useEffect, useState } from "react";
import type { BookFrontMatter, SaveFrontMatterInput } from "@/types/frontMatter";

export function useFrontMatterForm(data: BookFrontMatter | null, isOpen: boolean) {
  const [form, setForm] = useState<SaveFrontMatterInput | null>(null);

  useEffect(() => {
    if (data && isOpen) {
      const { created_at, updated_at, ...rest } = data;
      setForm(rest);
    }
  }, [data, isOpen]);

  const update = <K extends keyof SaveFrontMatterInput>(key: K, value: SaveFrontMatterInput[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  return { form, update };
}

