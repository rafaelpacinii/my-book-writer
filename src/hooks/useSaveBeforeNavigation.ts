"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useInternalLinkNavigation } from "@/hooks/useInternalLinkNavigation";

export function useSaveBeforeNavigation(enabled: boolean, save: () => Promise<boolean>) {
  const router = useRouter();
  const navigate = useCallback((href: string, proceed = () => router.push(href)) => {
    void save().then((saved) => { if (saved) proceed(); });
  }, [router, save]);
  useInternalLinkNavigation(enabled, navigate);
}
