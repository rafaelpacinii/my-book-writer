/** Runs in <head> during parsing; contains no user-provided script content. */
export const preferenceBootstrap = `(() => {
  const root = document.documentElement;
  let theme = "system";
  let collapsed = false;
  try {
    const stored = localStorage.getItem("mbw-theme-preference");
    if (stored === "light" || stored === "dark") theme = stored;
    collapsed = localStorage.getItem("mbw_sidebar_collapsed") === "true";
  } catch (error) { console.warn("Preferências locais indisponíveis.", error); }
  const resolved = theme === "system"
    ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
  root.dataset.theme = resolved;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  root.dataset.sidebarCollapsed = String(collapsed);
})();`;
