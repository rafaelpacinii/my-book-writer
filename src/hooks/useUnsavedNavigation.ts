"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useInternalLinkNavigation } from "@/hooks/useInternalLinkNavigation";

export function useUnsavedNavigation(isDirty: boolean, fallbackHref: string) {
  const router = useRouter();
  const [destination, setDestination] = useState<{ proceed: () => void } | null>(null);
  const requestNavigation = useCallback((href: string, proceed = () => router.push(href)) => {
    if (isDirty) setDestination({ proceed });
    else proceed();
  }, [isDirty, router]);
  useInternalLinkNavigation(isDirty, requestNavigation);

  return {
    isOpen: destination !== null,
    requestNavigation,
    close: () => setDestination(null),
    cancel: () => requestNavigation(fallbackHref),
    confirm: () => {
      const proceed = destination?.proceed ?? (() => router.push(fallbackHref));
      setDestination(null);
      proceed();
    },
  };
}
