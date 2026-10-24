"use client";

import { useEffect } from "react";
import type { Window } from "@tauri-apps/api/window";
import { getThemeSnapshot, subscribeTheme } from "@/lib/preferences/theme";

export function useDesktopWindowTheme(appWindow: Window | null, onError: (message: string) => void) {
  useEffect(() => {
    if (!appWindow) return;
    let active = true;
    let previous: string | null | undefined;
    let pending = Promise.resolve();
    const synchronize = () => {
      const preference = getThemeSnapshot().theme;
      const theme = preference === "system" ? null : preference;
      if (theme === previous) return;
      previous = theme;
      pending = pending.then(async () => {
        if (active) await appWindow.setTheme(theme);
      }).catch(() => {
        previous = undefined;
        if (active) onError("Não foi possível aplicar o tema à janela. Selecione o tema novamente nas configurações.");
      });
    };
    const unsubscribe = subscribeTheme(synchronize);
    synchronize();
    return () => { active = false; unsubscribe(); };
  }, [appWindow, onError]);
}
