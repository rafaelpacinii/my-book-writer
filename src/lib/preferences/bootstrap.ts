/** Runs in <head> during parsing; contains no user-provided script content. */
export const preferenceBootstrap = `(() => {
  const root = document.documentElement;
  root.dataset.desktop = String(Boolean(window.isTauri) && typeof window.__TAURI_INTERNALS__?.metadata?.currentWindow?.label === "string");
  let theme = "system";
  let collapsed = true;
  try {
    const stored = localStorage.getItem("mbw-theme-preference");
    if (stored === "light" || stored === "dark") theme = stored;
    collapsed = localStorage.getItem("mbw_sidebar_collapsed") !== "false";
  } catch (error) { console.warn("Preferências locais indisponíveis.", error); }
  const resolved = theme === "system"
    ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
  root.dataset.theme = resolved;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  root.dataset.sidebarCollapsed = String(collapsed);
})();`;
