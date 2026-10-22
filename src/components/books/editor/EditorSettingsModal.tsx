"use client";

import { Modal } from "@/components/ui/Modal";
import { useEditorLayoutSettings } from "@/hooks/useEditorLayoutSettings";
import { EditorSettingsFields } from "./EditorSettingsFields";
import type { EditorSettingsProps } from "./editorSettingsTypes";

export function EditorSettingsModal(props: EditorSettingsProps) {
  const settings = useEditorLayoutSettings(props);
  return (
    <Modal isOpen={props.isOpen} onClose={settings.close} title="Diagramação do livro"
      footer={(
        <>
          <button type="button" disabled={settings.isSaving} onClick={settings.close}
            className="min-h-10 rounded-md px-3 text-sm text-muted hover:bg-surface-hover hover:text-foreground disabled:opacity-50"
          >Cancelar</button>
          <button type="submit" form="editor-layout-form" disabled={settings.isSaving}
            className="min-h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >{settings.isSaving ? "Salvando..." : "Salvar alterações"}</button>
        </>
      )}
    >
      <form id="editor-layout-form" onSubmit={(event) => { event.preventDefault(); void settings.handleSave(); }}>
        <p className="mb-2 text-sm text-foreground">Estas alterações se aplicam ao livro inteiro.</p>
        <p className="mb-4 text-xs leading-relaxed text-muted">
          Confira o resultado no modo Paginado. O modo Contínuo usa uma apresentação própria para facilitar a escrita.
        </p>
        <fieldset disabled={settings.isSaving}>
          <EditorSettingsFields {...settings} formats={props.formats} fonts={props.fonts} />
        </fieldset>
        {settings.error && <p role="alert" className="mt-3 text-sm text-danger">{settings.error}</p>}
      </form>
    </Modal>
  );
}
