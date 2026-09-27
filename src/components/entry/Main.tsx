"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasCompletedOnboarding } from "@/utils/onboarding";
import { Main as AuthMain } from "@/components/auth/Main";

export function Main() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (hasCompletedOnboarding()) {
      router.replace("/home");
    } else {
      setShowAuth(true);
      setChecking(false);
    }
  }, [router]);

  if (checking && !showAuth) {
    return <div className="min-h-screen bg-background" />;
  }

  return <AuthMain />;
}
