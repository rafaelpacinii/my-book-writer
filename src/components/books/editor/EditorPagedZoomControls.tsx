interface Props {
  isFitMode: boolean;
  scalePercent: number;
  onSetFit: () => void;
  onReset100: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isFocusMode: boolean;
  onExitFocus: () => void;
}

export function EditorPagedZoomControls(props: Props) {
  const button = "px-2 py-1 rounded hover:text-foreground cursor-pointer";

  return (
    <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-lg">
      <button
        type="button"
        onClick={props.onSetFit}
        className={`${button} ${props.isFitMode ? "bg-primary text-primary-foreground" : ""}`}
      >
        Ajustar
      </button>
      <button type="button" onClick={props.onZoomOut} className={button} aria-label="Reduzir zoom">
        −
      </button>
      <button type="button" onClick={props.onReset100} className={button} title="100% tamanho real">
        {props.scalePercent}%
      </button>
      <button type="button" onClick={props.onZoomIn} className={button} aria-label="Aumentar zoom">
        +
      </button>
      {props.isFocusMode && (
        <button type="button" onClick={props.onExitFocus} className={button}>
          Sair do foco
        </button>
      )}
    </div>
  );
}
