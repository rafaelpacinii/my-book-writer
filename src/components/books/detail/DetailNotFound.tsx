import React from "react";
import Link from "next/link";
import { PageContent } from "@/components/shared/PageContent";

export function DetailNotFound() {
  return (
    <PageContent>
      <div className="pb-16 p-8 text-center bg-surface border border-border rounded-xl">
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
    </PageContent>
  );
}
