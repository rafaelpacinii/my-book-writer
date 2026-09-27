"use client";

import React from "react";
import { useProfile } from "@/hooks/useProfile";
import { getTimeGreeting } from "@/utils/format";

export function Greeting() {
  const { profile } = useProfile();
  const greeting = getTimeGreeting();
  const firstName = profile?.display_name?.trim().split(/\s+/)[0] || "Autor";

  return (
    <div className="mb-8 select-none">
      <p className="text-xs font-bold tracking-wider text-primary uppercase">
        Seu estúdio de escrita
      </p>
      <h1 className="font-serif text-3xl lg:text-[32px] font-normal text-foreground tracking-tight mt-2.5">
        {greeting}, {firstName}.
      </h1>
      <p className="text-base text-muted font-normal mt-1.5">
        Há uma história esperando por você.
      </p>
    </div>
  );
}
