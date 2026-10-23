"use client";

import React from "react";
import { Check, RotateCcw } from "lucide-react";
import { ReviewCommentMenu } from "./ReviewCommentMenu";

interface Props {
  isResolved: boolean;
  onResolve: () => void;
  onReopen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function ReviewCommentCardFooter(props: Props) {
  const { isResolved, onResolve, onReopen, onEdit, onDelete, disabled } = props;
  const statusClass = isResolved ? "bg-success/15 text-success" : "bg-warning/15 text-warning";

  return (
    <div className="flex items-center justify-between pt-1 border-t border-border/50">
      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${statusClass}`}>
        {isResolved ? "Resolvido" : "Aberto"}
      </span>

      <div className="flex items-center gap-1.5">
        {isResolved ? (
          <button
            type="button"
            onClick={onReopen}
            disabled={disabled}
            className="flex items-center gap-1 text-[11px] font-bold text-muted hover:text-foreground transition-colors cursor-pointer mr-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reabrir</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onResolve}
            disabled={disabled}
            className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer mr-1"
          >
            <Check className="w-3 h-3" />
            <span>Resolver</span>
          </button>
        )}

        <ReviewCommentMenu onEdit={onEdit} onDelete={onDelete} disabled={disabled} />
      </div>
    </div>
  );
}
