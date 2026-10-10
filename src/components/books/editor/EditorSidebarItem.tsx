"use client";

import React from "react";
import { GripVertical } from "lucide-react";

interface Props {
  id: string;
  badge: string;
  title: string;
  isActive: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export function EditorSidebarItem({
  badge,
  title,
  isActive,
  isDragging,
  isDragOver,
  onClick,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: Props) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`group relative w-full h-16 rounded-lg px-3 py-2 flex items-center gap-2 text-left transition-all cursor-pointer border ${
        isDragOver ? "border-dashed border-primary bg-primary-soft/40" : "border-transparent"
      } ${isDragging ? "opacity-40 scale-95" : ""} ${
        isActive ? "bg-primary-soft shadow-2xs" : "bg-transparent hover:bg-surface-hover"
      }`}
    >
      <div className="shrink-0 text-muted/40 group-hover:text-muted cursor-grab active:cursor-grabbing">
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
    </div>
  );
}
