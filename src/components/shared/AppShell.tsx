"use client";

import React from "react";
import { AppSidebar } from "./AppSidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <AppSidebar />
      <main className="flex-1 min-w-0 h-full overflow-y-auto p-6 sm:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}
