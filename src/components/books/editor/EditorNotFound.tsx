import React from "react";
import Link from "next/link";
import { PageContent } from "@/components/shared/PageContent";

interface Props {
  bookId: string;
}

export function EditorNotFound({ bookId }: Props) {
  return (
    <PageContent>
      <div className="max-w-4xl mx-auto py-16 p-8 text-center bg-surface border border-border rounded-xl">
        <h2 className="font-serif text-2xl font-normal text-foreground">
          Capítulo não encontrado
        </h2>
        <Link
          href={`/books/view?bookId=${encodeURIComponent(bookId)}`}
          className="text-sm font-bold text-primary mt-4 inline-block hover:underline"
        >
          Voltar para o livro
        </Link>
      </div>
    </PageContent>
  );
}
