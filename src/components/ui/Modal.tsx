"use client";

import React, { useId } from "react";
import { createPortal } from "react-dom";
import { useModalFocus } from "@/hooks/useModalFocus";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  const titleId = useId();
  const dialogRef = useModalFocus(isOpen, onClose);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : "Diálogo"}
      aria-modal="true"
      className="application-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface rounded-xl border border-border shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 id={titleId} className="text-lg font-bold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Fechar diálogo"
              className="text-muted hover:text-foreground cursor-pointer p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-background/50">
            {footer}
          </div>
        )}
      </div>
    </div>, document.body,
  );
}
