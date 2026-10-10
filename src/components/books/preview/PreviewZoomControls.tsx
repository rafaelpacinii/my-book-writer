import type { ZoomMode } from "./usePreviewZoom";

interface Props {
  mode: ZoomMode;
  scalePercent: number;
  onFitWidth: () => void;
  onFitHeight: () => void;
  onReset100: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function PreviewZoomControls(props: Props) {
  const btn = "px-2 py-1 rounded text-xs transition-colors cursor-pointer";
  const active = "bg-primary text-primary-foreground font-semibold";
  const idle = "text-muted hover:text-foreground hover:bg-surface-hover";
  const is100 = props.mode === "custom" && props.scalePercent === 100;

  return (
    <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-lg select-none">
      <button
        type="button" onClick={props.onFitWidth}
        className={`${btn} ${props.mode === "width" ? active : idle}`}
        title="Ajustar à largura disponível"
      >
        Largura
      </button>
      <button
        type="button" onClick={props.onFitHeight}
        className={`${btn} ${props.mode === "height" ? active : idle}`}
        title="Ajustar à altura disponível (página inteira)"
      >
        Altura
      </button>
      <div className="h-4 w-px bg-border mx-0.5" />
      <button type="button" onClick={props.onZoomOut} className={`${btn} ${idle}`} aria-label="Reduzir zoom">
        −
      </button>
      <button
        type="button" onClick={props.onReset100}
        className={`${btn} min-w-[44px] text-center font-mono ${is100 ? active : idle}`}
        title="Redefinir para 100%"
      >
        {props.scalePercent}%
      </button>
      <button type="button" onClick={props.onZoomIn} className={`${btn} ${idle}`} aria-label="Aumentar zoom">
        +
      </button>
    </div>
  );
}

