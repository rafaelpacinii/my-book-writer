"use client";

import { Copy, Minus, Square, X } from "lucide-react";
import { useWindowControlTooltip } from "@/hooks/useWindowControlTooltip";
import { SidebarTooltip } from "@/components/shared/SidebarTooltip";

interface ButtonProps {
  ariaLabel: string;
  tooltipLabel: string;
  disabled: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}

function WindowControlButton({
  ariaLabel, tooltipLabel, disabled, onClick, className = "", children,
}: ButtonProps) {
  const tooltip = useWindowControlTooltip();
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { tooltip.hide(); onClick(); }}
        aria-label={ariaLabel}
        aria-describedby={tooltip.position ? tooltip.id : undefined}
        onMouseEnter={tooltip.show}
        onMouseLeave={tooltip.hide}
        onFocus={tooltip.show}
        onBlur={tooltip.hide}
        className={className}
      >
        {children}
      </button>
      <SidebarTooltip id={tooltip.id} label={tooltipLabel} position={tooltip.position} />
    </>
  );
}

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
      <WindowControlButton ariaLabel="Minimizar janela" tooltipLabel="Minimizar" disabled={disabled} onClick={minimize}>
        <Minus aria-hidden="true" size={14} />
      </WindowControlButton>
      <WindowControlButton ariaLabel={maximizeLabel} tooltipLabel={maximizeLabel} disabled={disabled} onClick={maximize}>
        {isMaximized ? <Copy aria-hidden="true" size={12} /> : <Square aria-hidden="true" size={12} />}
      </WindowControlButton>
      <WindowControlButton ariaLabel="Fechar janela" tooltipLabel="Fechar" disabled={disabled} onClick={close} className="window-close">
        <X aria-hidden="true" size={15} />
      </WindowControlButton>
    </div>
  );
}
