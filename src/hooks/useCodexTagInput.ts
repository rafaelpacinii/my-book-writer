"use client";

import { useState } from "react";
import type { CodexJSON } from "@/types/codex";

export function useCodexTagInput(value: CodexJSON, onChange: (value: CodexJSON) => void) {
  const [text, setText] = useState(Array.isArray(value) ? value.join(", ") : "");
  return { text, change: (next: string) => {
    setText(next); onChange([...new Set(next.split(",").map((item) => item.trim()).filter(Boolean))]);
  } };
}
