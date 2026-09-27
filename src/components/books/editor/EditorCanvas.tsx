import React, { useEffect, useRef } from "react";

interface Props {
  text: string;
  onChange: (value: string) => void;
  fontSizePt?: number;
  lineHeightRatio?: number;
}

export function EditorCanvas({
  text,
  onChange,
  fontSizePt = 11,
  lineHeightRatio = 1.6,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-ajusta altura com base no conteúdo para rolagem natural da página
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(480, el.scrollHeight)}px`;
  }, [text]);

  const style = {
    fontSize: `${fontSizePt * 1.33}px`,
    lineHeight: lineHeightRatio,
  };

  return (
    <div className="w-full flex-1 flex flex-col py-4">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Comece a escrever a história deste capítulo aqui..."
        style={style}
        className="w-full flex-1 min-h-[480px] bg-transparent border-none outline-none resize-none font-serif text-foreground placeholder:text-muted/30 p-0 focus:ring-0 leading-relaxed tracking-normal"
        spellCheck="true"
      />
    </div>
  );
}
