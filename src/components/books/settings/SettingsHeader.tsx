"use client";

import React from "react";
import { BookBreadcrumbs } from "@/components/shared/BookBreadcrumbs";

interface Props {
  bookId: string;
  bookTitle: string;
}

export function SettingsHeader({ bookId, bookTitle }: Props) {
  return (
    <div className="mb-6 select-none">
      <div className="mb-4">
        <BookBreadcrumbs bookId={bookId} bookTitle={bookTitle} current="Configurações" />
      </div>

      <h1 className="font-serif text-3xl lg:text-[32px] font-normal text-foreground tracking-tight">
        Configurações do livro
      </h1>
      <p className="text-base text-muted font-normal mt-1.5">
        Ajuste os detalhes e a apresentação da sua obra.
      </p>
    </div>
  );
}
