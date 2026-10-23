"use client";

import { useState } from "react";
import { useHistoryAction } from "@/hooks/useHistoryAction";

export function useVersionRestore(onRestore: () => Promise<boolean>) {
  const [isOpen, setOpen] = useState(false);
  const action = useHistoryAction(isOpen);
  const close = () => { if (!action.isPending) setOpen(false); };
  const confirm = async () => {
    if (await action.run(async () => {
      if (!await onRestore()) throw new Error("Atualize a comparação antes de restaurar.");
    })) setOpen(false);
  };
  return { isOpen, open: () => setOpen(true), close, confirm, ...action };
}
