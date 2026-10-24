"use client";

import { Suspense } from "react";
import { X } from "lucide-react";
import { BrandAsset } from "@/components/shared/BrandAsset";
import { WindowControls } from "@/components/shared/WindowControls";
import { TitleBarNav } from "@/components/shared/TitleBarNav";
import { useDesktopWindow } from "@/hooks/useDesktopWindow";

export function AppTitleBar() {
  const controls = useDesktopWindow();
  return (
    <>
      <div data-app-titlebar className="app-titlebar" role="region" aria-label="Barra de título">
        <div data-tauri-drag-region className="titlebar-drag-region">
          <span data-titlebar-brand className="titlebar-brand" aria-hidden="true">
            <BrandAsset variant="micro" />
          </span>
          <span className="titlebar-title">My Book Writer</span>
          <Suspense fallback={null}>
            <TitleBarNav />
          </Suspense>
        </div>
        <WindowControls {...controls} />
      </div>
      {controls.error && (
        <div className="window-control-error" role="alert">
          <p>{controls.error}</p>
          <button type="button" onClick={controls.clearError} aria-label="Dispensar aviso da janela">
            <X aria-hidden="true" size={18} />
          </button>
        </div>
      )}
    </>
  );
}
