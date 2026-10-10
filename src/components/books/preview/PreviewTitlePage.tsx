import React from "react";
import type { BookFrontMatter } from "@/types/frontMatter";

interface Props {
  title: string;
  author: string;
  frontMatter: BookFrontMatter;
}

export function PreviewTitlePage({ title, author, frontMatter }: Props) {
  const { subtitle, publisher, edition, publication_year, publication_city } = frontMatter;

  return (
    <div className="h-full flex flex-col justify-between items-center text-center py-6 select-text">
      <div className="pt-12">
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-ink tracking-tight">
          {title || "Sem título"}
        </h1>
        {subtitle && (
          <p className="font-serif text-sm italic text-ink/70 mt-2 max-w-[85%] mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      <div>
        <p className="font-serif text-sm font-semibold tracking-wider uppercase text-ink">
          {author || "Autor"}
        </p>
      </div>

      <div className="text-[11px] text-ink/70 space-y-0.5 font-serif">
        {publisher && <p className="font-semibold text-ink">{publisher}</p>}
        <p>{edition || "1ª edição"}</p>
        {(publication_city || publication_year) && (
          <p>
            {[publication_city, publication_year].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}

