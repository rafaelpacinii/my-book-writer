"use client";

import { useEffect } from "react";
import { subscribeDataChanges } from "@/lib/data/changes";
import { invalidateAppResources } from "@/lib/data/appResources";
import { invalidateCoverResources } from "@/lib/data/coverResources";
import { invalidateCodexResources } from "@/lib/data/codexResources";

export function useAppDataChanges() {
  useEffect(() => subscribeDataChanges((change) => {
    invalidateAppResources(change);
    invalidateCodexResources(change);
    if (change === "restore") invalidateCoverResources();
  }), []);
}
