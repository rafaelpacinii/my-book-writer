import React from "react";
import { AppShell } from "@/components/shared/AppShell";

export function DetailSkeleton() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto pb-16 animate-pulse flex flex-col gap-6">
        <div className="h-6 w-24 bg-border/40 rounded-md" />
        <div className="h-10 w-80 bg-border/60 rounded-md" />
        <div className="h-4 w-40 bg-border/40 rounded-md" />
      </div>
    </AppShell>
  );
}
