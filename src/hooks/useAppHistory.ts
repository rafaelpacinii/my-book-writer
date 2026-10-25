"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getHistorySnapshot, getServerHistorySnapshot, subscribeHistory, trackAppHistory } from "@/lib/navigation/history";
import { requestHistoryNavigation } from "@/lib/navigation/requests";

export function useAppHistory() {
  const state = useSyncExternalStore(subscribeHistory, getHistorySnapshot, getServerHistorySnapshot);
  useEffect(trackAppHistory, []);
  return { ...state, back: () => requestHistoryNavigation(-1), forward: () => requestHistoryNavigation(1) };
}
