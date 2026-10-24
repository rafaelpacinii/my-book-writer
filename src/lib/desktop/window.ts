import { isTauri } from "@tauri-apps/api/core";

export function hasDesktopWindow(): boolean {
  if (!isTauri()) return false;
  const runtime = window as unknown as {
    __TAURI_INTERNALS__?: { metadata?: { currentWindow?: { label?: unknown } } };
  };
  return typeof runtime.__TAURI_INTERNALS__?.metadata?.currentWindow?.label === "string";
}
