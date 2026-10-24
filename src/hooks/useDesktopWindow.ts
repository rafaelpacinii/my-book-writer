"use client";

import { useEffect, useRef, useState } from "react";
import { getCurrentWindow, type Window } from "@tauri-apps/api/window";
import type { UnlistenFn } from "@tauri-apps/api/event";
import { hasDesktopWindow } from "@/lib/desktop/window";
import { useDesktopWindowTheme } from "@/hooks/useDesktopWindowTheme";

type WindowAction = "minimize" | "maximize" | "close";
const failures = {
  minimize: "Não foi possível minimizar a janela. Tente novamente.",
  maximize: "Não foi possível alterar o tamanho da janela. Tente novamente.",
  close: "Não foi possível fechar a janela. Tente novamente.",
};

export function useDesktopWindow() {
  const [appWindow, setWindow] = useState<Window | null>(null);
  const [isMaximized, setMaximized] = useState(false);
  const [isPending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = useRef(false);
  const running = useRef(false);
  useDesktopWindowTheme(appWindow, setError);

  useEffect(() => {
    active.current = true;
    if (!hasDesktopWindow()) return () => { active.current = false; };
    const current = getCurrentWindow();
    setWindow(current);
    let listening = true;
    let unlisten: UnlistenFn | undefined;
    let sequence = 0;
    const stopListening = (stop?: UnlistenFn) => {
      if (stop) void Promise.resolve().then(stop).catch((error: unknown) => {
        console.warn("Não foi possível remover o acompanhamento da janela.", error);
      });
    };
    const refresh = async () => {
      const request = ++sequence;
      try {
        const maximized = await current.isMaximized();
        if (listening && request === sequence) setMaximized(maximized);
      } catch {
        if (listening) setError("Não foi possível consultar o estado da janela.");
      }
    };
    void current.onResized(() => { void refresh(); }).then((stop) => {
      if (listening) unlisten = stop; else stopListening(stop);
    }).catch(() => { if (listening) setError("Não foi possível acompanhar o tamanho da janela."); });
    void refresh();
    return () => { active.current = false; listening = false; stopListening(unlisten); };
  }, []);

  const perform = async (action: WindowAction) => {
    if (!appWindow || running.current) return;
    running.current = true;
    setPending(true);
    setError(null);
    try {
      if (action === "minimize") await appWindow.minimize();
      if (action === "maximize") {
        await appWindow.toggleMaximize();
        const maximized = await appWindow.isMaximized();
        if (active.current) setMaximized(maximized);
      }
      if (action === "close") await appWindow.close();
    } catch {
      if (active.current) setError(failures[action]);
    } finally {
      running.current = false;
      if (active.current) setPending(false);
    }
  };

  return { isMaximized, disabled: !appWindow || isPending, error,
    minimize: () => void perform("minimize"), maximize: () => void perform("maximize"),
    close: () => void perform("close"), clearError: () => setError(null) };
}
