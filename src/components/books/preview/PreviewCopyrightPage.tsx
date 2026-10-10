import React from "react";
import type { BookFrontMatter } from "@/types/frontMatter";

interface Props {
  frontMatter: BookFrontMatter;
}

export function PreviewCopyrightPage({ frontMatter }: Props) {
  const {
    copyright_text, isbn_print, isbn_digital, cover_designer,
    proofreader, layout_designer, cataloging_data,
  } = frontMatter;

  return (
    <div className="h-full flex flex-col justify-end text-left text-[10px] leading-relaxed text-ink/80 font-serif pb-4 select-text">
      <div className="space-y-3 max-w-[90%]">
        <p className="font-sans font-medium text-[11px] text-ink">
          {copyright_text || "Todos os direitos reservados."}
        </p>

        {(isbn_print || isbn_digital) && (
          <div className="space-y-0.5 text-[9px] text-ink/70">
            {isbn_print && <p>ISBN (impresso): {isbn_print}</p>}
            {isbn_digital && <p>ISBN (digital): {isbn_digital}</p>}
          </div>
        )}

        {(cover_designer || proofreader || layout_designer) && (
          <div className="space-y-0.5 text-[9px] text-ink/70 pt-2 border-t border-ink/10">
            {cover_designer && <p>Capa: {cover_designer}</p>}
            {proofreader && <p>Revisão: {proofreader}</p>}
            {layout_designer && <p>Diagramação: {layout_designer}</p>}
          </div>
        )}

        {cataloging_data && (
          <div className="p-3 border border-ink/20 rounded text-[9px] font-mono leading-tight bg-ink/5 mt-3">
            <p className="whitespace-pre-line">{cataloging_data}</p>
          </div>
        )}
      </div>
    </div>
  );
}

