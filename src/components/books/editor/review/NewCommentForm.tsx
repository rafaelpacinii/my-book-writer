"use client";

import React, { useEffect, useRef, useState } from "react";
import { Plus, Quote, X } from "lucide-react";
import type { NewCommentFormProps } from "./types";

export function NewCommentForm(props: NewCommentFormProps) {
  const { onSubmit, isSubmitting, pendingExcerpt, onClearPendingExcerpt } = props;
  const [body, setBody] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (pendingExcerpt) {
      setExcerpt(pendingExcerpt);
      textareaRef.current?.focus();
    }
  }, [pendingExcerpt]);

  const handleCaptureSelection = () => {
    const sel = typeof window !== "undefined" ? window.getSelection()?.toString().trim() : "";
    if (sel) setExcerpt(sel);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || isSubmitting) return;
    await onSubmit(body, excerpt);
    setBody("");
    setExcerpt("");
    onClearPendingExcerpt?.();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-3 rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground">Novo comentário</span>
        <button type="button" onClick={handleCaptureSelection} className="text-[11px] font-bold text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer">
          <Quote className="w-3 h-3" />
          <span>Capturar</span>
        </button>
      </div>
      {excerpt && (
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-md bg-surface-hover text-xs text-muted">
          <span className="truncate italic">&ldquo;{excerpt}&rdquo;</span>
          <button type="button" onClick={() => { setExcerpt(""); onClearPendingExcerpt?.(); }} className="text-muted hover:text-danger cursor-pointer">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      <textarea
        ref={textareaRef} value={body} onChange={(e) => setBody(e.target.value)}
        placeholder="Escreva sua anotação ou sugestão..." rows={2}
        className="w-full text-xs p-2 rounded-lg border border-control-border bg-background text-foreground placeholder:text-muted focus:outline-hidden focus:border-primary resize-none"
      />
      <div className="flex justify-end">
        <button type="submit" disabled={!body.trim() || isSubmitting} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5 hover:bg-primary-hover disabled:opacity-40 cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          <span>{isSubmitting ? "Salvando..." : "Comentar"}</span>
        </button>
      </div>
    </form>
  );
}
