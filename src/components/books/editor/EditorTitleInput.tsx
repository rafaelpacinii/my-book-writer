import React from "react";

interface Props {
  chapterNumber: string;
  title: string;
  onChange: (value: string) => void;
}

export function EditorTitleInput({ chapterNumber, title, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1 w-full pt-4 pb-2">
      <span className="text-xs font-bold uppercase tracking-widest text-primary">
        {chapterNumber}
      </span>
      <input
        type="text"
        value={title}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Título do capítulo..."
        className="w-full font-serif text-2xl sm:text-3xl font-normal text-foreground bg-transparent border-none outline-none focus:ring-0 p-0 placeholder:text-muted/40"
      />
    </div>
  );
}
