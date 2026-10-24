"use client";

import { useState, type FormEvent } from "react";
import type { LibraryCollection } from "@/types/library";
import type { LibraryMove } from "@/hooks/useLibraryMove";

export function useLibraryMoveForm(collections: LibraryCollection[], move: LibraryMove) {
  const [error, setError] = useState<string | null>(null);
  const [destination, setDestination] = useState("root");
  async function submit(event: FormEvent) {
    event.preventDefault();
    const target = collections.find((item) => `${item.kind}:${item.collection.id}` === destination);
    setError(null);
    if (destination !== "root" && !target) {
      setError("O destino não está mais disponível. Escolha outro.");
      return;
    }
    const destinationTarget = target ?? { kind: "root" as const };
    if (move.movingBook) await move.move(move.movingBook.id, destinationTarget);
    else if (move.movingSeries) await move.moveSeries(move.movingSeries.id, destinationTarget);
  }
  return { destination, setDestination, submit, error };
}
