"use client";

import React from "react";
import { GripVertical, Trash2 } from "lucide-react";
import type { EditorSidebarItemProps } from "./editorSidebarTypes";

export function EditorSidebarItem(props: EditorSidebarItemProps) {
  const {
    badge, title, isActive, isDragging, isDragOver,
    onClick, onDeleteClick, onDragStart, onDragOver,
    onDragLeave, onDrop, onDragEnd,
  } = props;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`group relative w-full h-16 rounded-lg px-3 py-2 flex items-center gap-2 text-left transition-colors duration-150 cursor-pointer border ${
        isDragOver ? "border-dashed border-primary bg-primary-soft/40" : "border-transparent"
      } ${isDragging ? "opacity-40 scale-95" : ""} ${
        isActive ? "bg-primary-soft shadow-2xs" : "bg-transparent hover:bg-surface-hover"
      }`}
    >
      <div className="shrink-0 text-muted/60 group-hover:text-foreground cursor-grab active:cursor-grabbing">
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {badge ? (
          <span className={`text-[11px] font-bold truncate ${isActive ? "text-primary" : "text-muted"}`}>
            {badge}
          </span>
        ) : null}
        <span className={`text-xs truncate ${badge ? "mt-0.5" : ""} ${isActive ? "text-primary font-bold" : "text-foreground font-normal"}`}>
          {title || "Sem título"}
        </span>
      </div>

      {onDeleteClick && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick();
          }}
          className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto p-1.5 rounded-md text-muted hover:text-danger hover:bg-danger-soft transition-colors duration-150 cursor-pointer shrink-0"
          title="Excluir capítulo"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
