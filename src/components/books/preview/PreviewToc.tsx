import type { PreviewChapter } from "@/types/preview";
import type { FrontMatterPageItem } from "@/utils/frontMatterPages";

interface Props {
  frontMatterPages?: FrontMatterPageItem[];
  activeFrontMatterIndex?: number;
  onSelectFrontMatter?: (index: number) => void;
  chapters: PreviewChapter[];
  activeIndex: number;
  onSelect: (index: number) => void;
  isFrontMatter?: boolean;
}

export function PreviewToc({
  frontMatterPages = [], activeFrontMatterIndex = -1, onSelectFrontMatter,
  chapters, activeIndex, onSelect, isFrontMatter = false,
}: Props) {
  const itemClass = (active: boolean) =>
    `w-full rounded-lg px-3 py-2 flex flex-col justify-center text-left transition-colors cursor-pointer ${
      active ? "bg-primary-soft shadow-2xs" : "hover:bg-surface-hover"
    }`;

  return (
    <nav aria-label="Sumário" className="hidden md:flex w-[244px] h-full shrink-0 border-r border-border bg-surface flex-col py-4 px-3 select-none">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {frontMatterPages.length > 0 && (
          <div>
            <p className="px-2 pb-2 text-[10px] font-bold tracking-wider text-muted uppercase">Páginas Iniciais</p>
            <div className="space-y-1">
              {frontMatterPages.map((item, idx) => {
                if (item.kind === "blank") return null;
                const active = isFrontMatter && idx === activeFrontMatterIndex;
                return (
                  <button key={item.pageNumber} type="button" onClick={() => onSelectFrontMatter?.(idx)} className={itemClass(active)}>
                    <span className={`text-xs truncate ${active ? "text-primary font-bold" : "text-foreground font-normal"}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <p className="px-2 pb-2 text-[10px] font-bold tracking-wider text-muted uppercase">Capítulos</p>
          <div className="space-y-1">
            {chapters.map((chapter, index) => {
              const active = !isFrontMatter && index === activeIndex;
              const hasNum = Boolean(chapter.number);
              return (
                <button key={chapter.id} type="button" onClick={() => onSelect(index)} className={itemClass(active)}>
                  {hasNum && (
                    <span className={`text-[11px] font-bold truncate ${active ? "text-primary" : "text-muted"}`}>
                      {chapter.number}
                    </span>
                  )}
                  <span className={`text-xs truncate ${hasNum ? "mt-0.5" : ""} ${active ? "text-primary font-bold" : "text-foreground font-normal"}`}>
                    {chapter.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
