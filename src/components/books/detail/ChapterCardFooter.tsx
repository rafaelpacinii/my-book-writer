"use client";

import React from "react";
import { AlertCircle, MessageSquare } from "lucide-react";
import { formatLastEdited } from "@/utils/format";

interface Props {
  updatedAt: string;
  needsRecheck: boolean;
  openCommentsCount: number;
}

export function ChapterCardFooter({
  updatedAt,
  needsRecheck,
  openCommentsCount,
}: Props) {
  return (
    <div className="border-t border-border pt-3 mt-4 flex items-center justify-between gap-2">
      <p className="text-xs text-muted truncate">
        Última edição {formatLastEdited(updatedAt)}
      </p>

      <div className="flex items-center gap-1.5 shrink-0">
        {openCommentsCount > 0 && (
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-soft text-primary flex items-center gap-1"
            title={`${openCommentsCount} comentário(s) em aberto`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>{openCommentsCount}</span>
          </span>
        )}

        {needsRecheck && (
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-warning-soft text-warning flex items-center gap-1"
            title="Capítulo sinalizado para revisão"
          >
            <AlertCircle className="w-3 h-3" />
            <span>Rever</span>
          </span>
        )}
      </div>
    </div>
  );
}

