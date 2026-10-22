"use client";

import { useEffect, useState } from "react";
import type { BookFrontMatter, SaveFrontMatterInput } from "@/types/frontMatter";

export function useFrontMatterForm(data: BookFrontMatter | null) {
  const [form, setForm] = useState<SaveFrontMatterInput | null>(null);
  const baseline = data ? (({ created_at, updated_at, ...rest }) => rest)(data) : null;

  useEffect(() => {
    if (data) {
      const { created_at, updated_at, ...rest } = data;
      setForm(rest);
    }
  }, [data]);

  const update = <K extends keyof SaveFrontMatterInput>(key: K, value: SaveFrontMatterInput[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  return { form, update, isDirty: Boolean(form && baseline && JSON.stringify(form) !== JSON.stringify(baseline)) };
}

