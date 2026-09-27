"use client";

import React, { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { ChapterMenuItems } from "./ChapterMenuItems";

interface Props {
  onRename: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function ChapterCardMenu(props: Props) {
  const { onRename, onMoveUp, onMoveDown, onDelete, canMoveUp, canMoveDown } = props;
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const wrap = (action: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    action();
  };

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={toggle}
        className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
        title="Opções do capítulo"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <ChapterMenuItems
          onRename={wrap(onRename)}
          onMoveUp={wrap(onMoveUp)}
          onMoveDown={wrap(onMoveDown)}
          onDelete={wrap(onDelete)}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
        />
      )}
    </div>
  );
}
