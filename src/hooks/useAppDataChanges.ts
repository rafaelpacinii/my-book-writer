"use client";

import { useEffect } from "react";
import { subscribeDataChanges } from "@/lib/data/changes";
import { invalidateAppResources } from "@/lib/data/appResources";
import { invalidateCoverResources } from "@/lib/data/coverResources";

export function useAppDataChanges() {
  useEffect(() => subscribeDataChanges((change) => {
    invalidateAppResources(change);
    if (change === "restore") invalidateCoverResources();
  }), []);
}
