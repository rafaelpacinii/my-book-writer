"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useInternalLinkNavigation } from "@/hooks/useInternalLinkNavigation";

export function useUnsavedNavigation(isDirty: boolean, fallbackHref: string) {
  const router = useRouter();
  const [destination, setDestination] = useState<string | null>(null);
  const requestNavigation = useCallback((href: string) => {
    if (isDirty) setDestination(href);
    else router.push(href);
  }, [isDirty, router]);
  useInternalLinkNavigation(isDirty, requestNavigation);

  return {
    isOpen: destination !== null,
    close: () => setDestination(null),
    cancel: () => requestNavigation(fallbackHref),
    confirm: () => {
      const href = destination || fallbackHref;
      setDestination(null);
      router.push(href);
    },
  };
}
