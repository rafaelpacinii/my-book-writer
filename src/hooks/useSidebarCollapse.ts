"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "mbw_sidebar_collapsed";
let collapsed = false;
const listeners = new Set<() => void>();
const getSnapshot = () => collapsed;
const getServerSnapshot = () => false;

function publish(value: boolean) {
  collapsed = value;
  document.documentElement.dataset.sidebarCollapsed = String(value);
  listeners.forEach((listener) => listener());
}

function initialize() {
  try { publish(localStorage.getItem(STORAGE_KEY) === "true"); }
  catch (error) { console.warn("Não foi possível ler a preferência do menu.", error); }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) initialize();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSidebarCollapse() {
  const isCollapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useLayoutEffect(initialize, []);
  const toggle = () => {
    publish(!collapsed);
    try { localStorage.setItem(STORAGE_KEY, String(collapsed)); }
    catch (error) { console.warn("A preferência do menu não será preservada ao reiniciar.", error); }
  };
  return { isCollapsed, toggle };
}
