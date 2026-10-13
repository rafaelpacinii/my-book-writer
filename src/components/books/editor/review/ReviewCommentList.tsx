"use client";

import React from "react";
import { MessageSquareDashed } from "lucide-react";
import type { ReviewComment } from "@/types/review";
import { ReviewCommentCard } from "./ReviewCommentCard";

interface Props {
  comments: ReviewComment[];
  onResolve: (id: string) => void;
  onReopen: (id: string) => void;
  onEdit: (id: string, body: string) => Promise<void> | void;
  onDelete: (id: string) => void;
}

export function ReviewCommentList(props: Props) {
  const { comments, onResolve, onReopen, onEdit, onDelete } = props;

  if (comments.length === 0) {
    return (
      <div className="py-8 px-4 text-center flex flex-col items-center gap-2 text-muted">
        <MessageSquareDashed className="w-8 h-8 opacity-40" />
        <p className="text-xs font-medium">Nenhum comentário nesta lista.</p>
        <p className="text-[11px] opacity-75">
          Adicione notas acima para registrar pontos de revisão.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 pb-6">
      {comments.map((comment) => (
        <ReviewCommentCard
          key={comment.id}
          comment={comment}
          onResolve={() => onResolve(comment.id)}
          onReopen={() => onReopen(comment.id)}
          onEdit={(body) => onEdit(comment.id, body)}
          onDelete={() => onDelete(comment.id)}
        />
      ))}
    </div>
  );
}
