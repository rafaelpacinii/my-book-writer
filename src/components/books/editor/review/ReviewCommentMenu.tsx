"use client";

import React, { useEffect, useRef, useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

interface Props {
  onEdit: () => void;
  onDelete: () => void;
}

export function ReviewCommentMenu({ onEdit, onDelete }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded text-muted hover:text-foreground transition-colors cursor-pointer"
        title="Configurações da anotação"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-1 w-28 bg-surface border border-border rounded-lg shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
          <button
            type="button"
            onClick={() => { setIsOpen(false); onEdit(); }}
            className="w-full px-2.5 py-1.5 text-xs text-foreground hover:bg-surface-hover flex items-center gap-2 cursor-pointer"
          >
            <Pencil className="w-3 h-3 text-muted" />
            <span>Editar</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsOpen(false); onDelete(); }}
            className="w-full px-2.5 py-1.5 text-xs text-danger hover:bg-danger/10 flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3 h-3 text-danger" />
            <span>Excluir</span>
          </button>
        </div>
      )}
    </div>
  );
}

