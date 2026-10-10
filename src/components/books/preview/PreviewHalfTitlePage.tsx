import React from "react";

interface Props {
  title: string;
  author: string;
}

export function PreviewHalfTitlePage({ title, author }: Props) {
  return (
    <div className="h-full flex flex-col justify-center items-center text-center pb-20 select-text">
      <h1 className="font-serif text-xl sm:text-2xl font-normal text-ink tracking-tight max-w-[80%]">
        {title || "Sem título"}
      </h1>
      <p className="font-serif text-xs text-ink/70 mt-3 tracking-wide">
        {author || "Autor"}
      </p>
    </div>
  );
}

