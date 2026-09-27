"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function NewBookHeader() {
  const router = useRouter();

  return (
    <div className="mb-6 select-none">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-muted hover:text-foreground transition-colors cursor-pointer mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar</span>
      </button>

      <h1 className="font-serif text-3xl lg:text-[32px] font-normal text-foreground tracking-tight">
        Uma nova história.
      </h1>
      <p className="text-base text-muted font-normal mt-1.5">
        Comece pelo essencial. Você pode ajustar tudo depois.
      </p>
    </div>
  );
}
