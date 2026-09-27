import React from "react";

export function EmptyChaptersNotice() {
  return (
    <div className="flex flex-col justify-center p-6 sm:p-8 rounded-xl bg-surface border border-border/60 min-h-52 select-none">
      <h3 className="font-serif text-xl sm:text-2xl font-normal text-foreground">
        As palavras vêm depois do primeiro passo.
      </h3>
      <p className="text-sm text-muted mt-2">
        Crie um capítulo e comece a escrever.
      </p>
    </div>
  );
}
