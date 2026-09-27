import React from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { BookFormat, FontPreset } from "@/types/catalog";

interface Props {
  title: string;
  setTitle: (val: string) => void;
  titleError?: string | null;
  author: string;
  setAuthor: (val: string) => void;
  formatId: string;
  setFormatId: (val: string) => void;
  formats: BookFormat[];
  fontId: string;
  setFontId: (val: string) => void;
  fonts: FontPreset[];
}

export function BookInfoFields(props: Props) {
  const { title, setTitle, titleError, author, setAuthor } = props;
  const { formatId, setFormatId, formats, fontId, setFontId, fonts } = props;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-bold text-lg text-foreground mb-1">
        Informações do livro
      </h2>

      <Input
        label="Título do livro"
        placeholder="Ex: O lugar onde o tempo demora"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={titleError ?? undefined}
        autoFocus
      />

      <Input
        label="Autor"
        placeholder="Ex: Helena Duarte"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        hint="Use seu nome ou um pseudônimo."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Formato"
          value={formatId}
          onChange={(e) => setFormatId(e.target.value)}
          options={formats.map((f) => ({ value: f.id, label: f.name }))}
        />

        <Select
          label="Fonte"
          value={fontId}
          onChange={(e) => setFontId(e.target.value)}
          options={fonts.map((f) => ({ value: f.id, label: f.name }))}
        />
      </div>
    </div>
  );
}
