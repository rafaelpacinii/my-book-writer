import type { Page } from "@playwright/test";
import { mockUI } from "@/tests/e2e/uiMock";

export interface WindowRuntime {
  windowCalls: string[];
  windowThemes: (string | null)[];
  windowMaximized: boolean;
  windowFailure: string | null;
  emitWindowResize: () => void;
}

export async function mockDesktopWindow(page: Page, options: Parameters<typeof mockUI>[1] = {}) {
  await mockUI(page, options);
  await page.addInitScript(() => {
    const runtime = window as unknown as WindowRuntime & {
      isTauri: boolean;
      __TAURI_INTERNALS__: {
        invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown>;
        metadata: { currentWindow: { label: string }; currentWebview: { label: string } };
        transformCallback: (callback: (event: unknown) => void) => number;
      };
      __TAURI_EVENT_PLUGIN_INTERNALS__: { unregisterListener: (event: string, id: number) => void };
    };
    Object.assign(runtime, { isTauri: true, windowCalls: [], windowThemes: [], windowMaximized: false, windowFailure: null });
    const invoke = runtime.__TAURI_INTERNALS__.invoke;
    const callbacks = new Map<number, (event: unknown) => void>();
    const listeners = new Map<number, string>();
    let nextId = 0;
    Object.assign(runtime.__TAURI_INTERNALS__, {
      metadata: { currentWindow: { label: "main" }, currentWebview: { label: "main" } },
      transformCallback: (callback: (event: unknown) => void) => { callbacks.set(++nextId, callback); return nextId; },
      invoke: async (command: string, args?: Record<string, unknown>) => {
        if (!command.startsWith("plugin:window|") && !command.startsWith("plugin:event|")) return invoke(command, args);
        runtime.windowCalls.push(command);
        if (command === runtime.windowFailure) throw new Error("Native command failed");
        if (command === "plugin:event|listen") { const id = Number(args?.handler); listeners.set(id, String(args?.event)); return id; }
        if (command === "plugin:event|unlisten") return null;
        if (command === "plugin:window|is_maximized") return runtime.windowMaximized;
        if (command === "plugin:window|toggle_maximize") runtime.windowMaximized = !runtime.windowMaximized;
        if (command === "plugin:window|set_theme") runtime.windowThemes.push(args?.value as string | null);
        return null;
      },
    });
    runtime.__TAURI_EVENT_PLUGIN_INTERNALS__ = { unregisterListener: (_event, id) => { callbacks.delete(id); listeners.delete(id); } };
    runtime.emitWindowResize = () => {
      for (const [id, event] of listeners) if (event === "tauri://resize") callbacks.get(id)?.({ event, id, payload: { width: 1200, height: 900 } });
    };
  });
}
