import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/shared/AppShell";

export function DetailNotFound() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto pb-16 p-8 text-center bg-surface border border-border rounded-xl">
        <h2 className="font-serif text-2xl font-normal text-foreground">
          Livro não encontrado
        </h2>
        <Link
          href="/library"
          className="text-sm font-bold text-primary mt-4 inline-block hover:underline"
        >
          Voltar para a biblioteca
        </Link>
      </div>
    </AppShell>
  );
}
