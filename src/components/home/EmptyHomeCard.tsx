import React from "react";
import Link from "next/link";
import { ContinueArtwork } from "./ContinueArtwork";

export function EmptyHomeCard() {
  return (
    <div className="flex flex-col md:flex-row w-full rounded-2xl bg-primary-soft/50 border border-primary-soft overflow-hidden shadow-xs">
      <ContinueArtwork />
      <div className="flex flex-col justify-center p-6 lg:p-8 flex-1 min-w-0">
        <h2 className="font-serif text-2xl lg:text-[29px] font-normal text-foreground leading-snug">
          Sua primeira página ainda está por escrever.
        </h2>
        <p className="text-[15px] text-muted mt-3">
          Comece com um título. O resto vem com as palavras.
        </p>
        <div className="mt-6">
          <Link
            href="/books/new"
            className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-primary text-primary-foreground font-bold text-[13px] hover:opacity-90 transition-opacity shadow-xs"
          >
            Criar primeiro livro
          </Link>
        </div>
      </div>
    </div>
  );
}
