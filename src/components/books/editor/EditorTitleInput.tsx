import React from "react";

interface Props {
  chapterNumber: string;
  title: string;
  onChange: (value: string) => void;
}

export function EditorTitleInput({ chapterNumber, title, onChange }: Props) {
  return (
    <div className="flex flex-col w-full pt-4">
      <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
        {chapterNumber}
      </span>
      <input
        type="text"
        value={title}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Título do capítulo..."
        className="w-full font-serif text-3xl font-normal text-foreground bg-transparent border-none outline-none focus:ring-0 p-0 placeholder:text-muted/40 mb-4"
      />
      <div className="w-full border-b border-border mb-6" />
    </div>
  );
}
