export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
const initial = { theme: "system" as ThemePreference, resolvedTheme: "light" as ResolvedTheme };
let state = initial;
const listeners = new Set<() => void>();

function apply() {
  const root = document.documentElement;
  root.classList.toggle("dark", state.resolvedTheme === "dark");
  root.dataset.theme = state.resolvedTheme;
  root.style.colorScheme = state.resolvedTheme;
}

function resolve(theme: ThemePreference) {
  return theme === "system"
    ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
}

function publish(theme: ThemePreference) {
  const resolvedTheme = resolve(theme);
  if (state.theme !== theme || state.resolvedTheme !== resolvedTheme) {
    state = { theme, resolvedTheme };
  }
  apply();
  listeners.forEach((listener) => listener());
}

export function initializeTheme() {
  let saved: string | null = null;
  try { saved = localStorage.getItem("mbw-theme-preference"); }
  catch (error) { console.warn("Não foi possível ler o tema salvo.", error); }
  publish(saved === "light" || saved === "dark" ? saved : "system");
}

export function setTheme(theme: ThemePreference) {
  publish(theme);
  try { localStorage.setItem("mbw-theme-preference", theme); }
  catch (error) { console.warn("O tema não será preservado ao reiniciar.", error); }
}

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  const media = matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => { if (state.theme === "system") publish("system"); };
  const onStorage = (event: StorageEvent) => {
    if (event.key === "mbw-theme-preference" || event.key === null) initializeTheme();
  };
  media.addEventListener("change", onSystemChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
  };
}

export const getThemeSnapshot = () => state;
export const getServerThemeSnapshot = () => initial;
export const toggleTheme = () => setTheme(state.resolvedTheme === "dark" ? "light" : "dark");
