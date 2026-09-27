import React from "react";
import { AppShell } from "@/components/shared/AppShell";

export function EditorSkeleton() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-10 animate-pulse flex flex-col gap-6">
        <div className="h-6 w-32 bg-border/40 rounded-md" />
        <div className="h-10 w-96 bg-border/60 rounded-md" />
        <div className="h-96 w-full bg-border/20 rounded-xl" />
      </div>
    </AppShell>
  );
}
