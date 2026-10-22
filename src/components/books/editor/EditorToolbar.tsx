"use client";

import { EditorToolbarFormatting, type FormattingProps } from "./EditorToolbarFormatting";
import { EditorInsertMenu } from "./EditorInsertMenu";

export function EditorToolbar(props: FormattingProps) {
  return (
    <div role="group" aria-label="Formatação do texto" className="flex shrink-0 items-center gap-1">
      <EditorToolbarFormatting {...props} />
      <EditorInsertMenu onFormat={props.onFormat} />
    </div>
  );
}
