"use client";

import { useSyncExternalStore } from "react";
import type { MeasurementUnit } from "@/utils/bookMeasurements";

const STORAGE_KEY = "mbw-measurement-unit";
const CHANGE_EVENT = "mbw-measurement-unit-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getSnapshot(): MeasurementUnit {
  return localStorage.getItem(STORAGE_KEY) === "in" ? "in" : "cm";
}

function setUnit(unit: MeasurementUnit) {
  localStorage.setItem(STORAGE_KEY, unit);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useMeasurementUnit() {
  const unit = useSyncExternalStore(subscribe, getSnapshot, () => "cm" as const);
  return { unit, setUnit };
}
