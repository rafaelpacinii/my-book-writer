import { Copy, Minus, Square, X } from "lucide-react";

interface Props {
  isMaximized: boolean;
  disabled: boolean;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

export function WindowControls({ isMaximized, disabled, minimize, maximize, close }: Props) {
  const maximizeLabel = isMaximized ? "Restaurar janela" : "Maximizar janela";
  return (
    <div className="window-controls" role="group" aria-label="Controles da janela">
      <button type="button" disabled={disabled} onClick={minimize} aria-label="Minimizar janela" title="Minimizar">
        <Minus aria-hidden="true" size={14} />
      </button>
      <button type="button" disabled={disabled} onClick={maximize} aria-label={maximizeLabel} title={maximizeLabel}>
        {isMaximized ? <Copy aria-hidden="true" size={12} /> : <Square aria-hidden="true" size={12} />}
      </button>
      <button type="button" disabled={disabled} onClick={close} aria-label="Fechar janela" title="Fechar" className="window-close">
        <X aria-hidden="true" size={15} />
      </button>
    </div>
  );
}
