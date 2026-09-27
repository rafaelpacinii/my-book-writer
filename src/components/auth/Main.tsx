"use client";

import React, { useState } from "react";
import { AuthHeader } from "./AuthHeader";
import { AuthArtwork } from "./AuthArtwork";
import { WelcomeView } from "./WelcomeView";
import { AuthForm } from "./AuthForm";

export function Main() {
  const [view, setView] = useState<"welcome" | "auth">("welcome");

  const handleOffline = () => {
    window.location.href = "/library";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AuthHeader />
      <main className="flex-1 flex items-center justify-center w-full max-w-[1440px] mx-auto px-8 lg:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 w-full items-start">
          <div className="hidden lg:flex justify-start">
            <AuthArtwork />
          </div>

          <div className="flex items-center justify-center lg:justify-start w-full">
            {view === "welcome" ? (
              <WelcomeView
                onGoToAuth={() => setView("auth")}
                onContinueOffline={handleOffline}
              />
            ) : (
              <AuthForm
                onBack={() => setView("welcome")}
                onContinueOffline={handleOffline}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
