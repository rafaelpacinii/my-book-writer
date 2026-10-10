import type { PreviewChapter } from "@/types/preview";

interface Props {
  chapters: PreviewChapter[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function PreviewToc({ chapters, activeIndex, onSelect }: Props) {
  return (
    <nav aria-label="Sumário" className="hidden md:flex w-[244px] h-full shrink-0 border-r border-border bg-surface flex-col py-4 px-3 select-none">
      <p className="px-2 pb-3 text-[11px] font-bold tracking-wider text-muted uppercase">Sumário</p>
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {chapters.map((chapter, index) => {
          const active = index === activeIndex;
          return (
            <button
              type="button"
              key={chapter.id}
              onClick={() => onSelect(index)}
              aria-current={active ? "true" : undefined}
              className={`w-full h-16 rounded-lg px-3.5 py-2 flex flex-col justify-center text-left transition-colors cursor-pointer ${active ? "bg-primary-soft" : "hover:bg-surface-hover"}`}
            >
              <span className={`text-xs font-bold ${active ? "text-primary" : "text-muted"}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-xs text-foreground truncate mt-0.5">{chapter.title}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

