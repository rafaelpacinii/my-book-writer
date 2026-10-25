"use client";

import { useEffect } from "react";
import { subscribeDataChanges } from "@/lib/data/changes";
import { invalidateAppResources } from "@/lib/data/appResources";
import { invalidateCoverResources } from "@/lib/data/coverResources";
import { invalidateCodexResources } from "@/lib/data/codexResources";
import { invalidateCodexImages } from "@/lib/data/codexImageResources";

export function useAppDataChanges() {
  useEffect(() => subscribeDataChanges((change) => {
    invalidateAppResources(change);
    invalidateCodexResources(change);
    invalidateCodexImages(change);
    if (change === "restore") invalidateCoverResources();
  }), []);
}
