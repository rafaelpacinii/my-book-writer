"use client";

import React from "react";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      <AppHeader />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}
