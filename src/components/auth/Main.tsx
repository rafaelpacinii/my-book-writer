"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { setCompletedOnboarding } from "@/utils/onboarding";
import { AuthHeader } from "./AuthHeader";
import { AuthArtwork } from "./AuthArtwork";
import { WelcomeView } from "./WelcomeView";
import { AuthForm } from "./AuthForm";
import { OfflineProfileView } from "./OfflineProfileView";

export function Main() {
  const router = useRouter();
  const { updateDisplayName } = useProfile();
  const [view, setView] = useState<"welcome" | "auth" | "offline">("welcome");
  const [isSaving, setIsSaving] = useState(false);

  const handleOfflineSubmit = async (name: string) => {
    setIsSaving(true);
    try {
      await updateDisplayName(name);
    } catch {
      // continues even if error
    } finally {
      setIsSaving(false);
      setCompletedOnboarding(true);
      router.push("/home");
    }
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
            {view === "welcome" && (
              <WelcomeView
                onGoToAuth={() => setView("auth")}
                onContinueOffline={() => setView("offline")}
              />
            )}
            {view === "auth" && (
              <AuthForm
                onBack={() => setView("welcome")}
                onContinueOffline={() => setView("offline")}
              />
            )}
            {view === "offline" && (
              <OfflineProfileView
                onBack={() => setView("welcome")}
                onSubmit={handleOfflineSubmit}
                isLoading={isSaving}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
