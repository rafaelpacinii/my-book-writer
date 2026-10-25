// Earlier trackers could corrupt their indices; start a fresh chain when upgrading.
const KEY = "mbw_navigation_history_v2";
type Entry = { session: string; index: number };
type HistoryBounds = { session: string; last: number };
const empty = { canBack: false, canForward: false };
let snapshot = empty;
const listeners = new Set<() => void>();

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" ? value as Record<string, unknown> : {};
}

function entry(value: unknown): Entry | null {
  const item = record(record(value)[KEY]);
  return typeof item.session === "string" && Number.isInteger(item.index) && Number(item.index) >= 0
    ? { session: item.session, index: Number(item.index) } : null;
}

function bounds(): HistoryBounds | null {
  try {
    const value = record(JSON.parse(sessionStorage.getItem(KEY) ?? "null"));
    return typeof value.session === "string" && Number.isInteger(value.last)
      ? { session: value.session, last: Number(value.last) } : null;
  } catch (error) {
    console.warn("Não foi possível restaurar o histórico de navegação.", error);
    return null;
  }
}

/** Index this tab's known app entries while preserving Next.js history metadata. */
export function trackAppHistory() {
  const push = history.pushState;
  const replace = history.replaceState;
  let active = true;
  const saved = bounds();
  const current = entry(history.state);
  const restored = current && saved && current.session === saved.session;
  let position = restored ? current.index : 0;
  const session = restored ? current.session : crypto.randomUUID();
  let last = restored ? Math.max(position, saved.last) : 0;
  const syncPosition = () => {
    const value = entry(history.state);
    if (value?.session === session) position = value.index;
  };
  const state = (data: unknown) => ({ ...record(data), [KEY]: { session, index: position } });
  const publish = () => {
    const next = { canBack: position > 0, canForward: position < last };
    if (next.canBack !== snapshot.canBack || next.canForward !== snapshot.canForward) {
      snapshot = next;
      // Next.js writes history during commit; notify React after that commit finishes.
      queueMicrotask(() => listeners.forEach((listener) => listener()));
    }
    try { sessionStorage.setItem(KEY, JSON.stringify({ session, last })); }
    catch (error) { console.warn("O histórico de navegação não será preservado ao recarregar.", error); }
  };
  const pushState: History["pushState"] = (data: unknown, title: string, url?: string | URL | null) => {
    if (!active) return push.call(history, data, title, url);
    syncPosition();
    const previous = position;
    position += 1;
    try { push.call(history, state(data), title, url); }
    catch (error) { position = previous; throw error; }
    last = position;
    publish();
  };
  const replaceState: History["replaceState"] = (data: unknown, title: string, url?: string | URL | null) => {
    if (!active) return replace.call(history, data, title, url);
    syncPosition();
    replace.call(history, state(data), title, url);
    publish();
  };
  const onPopState = (event: PopStateEvent) => {
    const value = entry(event.state);
    if (value?.session !== session) return;
    position = value.index;
    publish();
  };
  replace.call(history, state(history.state), "");
  history.pushState = pushState;
  history.replaceState = replaceState;
  window.addEventListener("popstate", onPopState);
  publish();
  return () => {
    // Router wrappers may retain these functions after an effect replay or hot reload.
    active = false;
    if (history.pushState === pushState) history.pushState = push;
    if (history.replaceState === replaceState) history.replaceState = replace;
    window.removeEventListener("popstate", onPopState);
  };
}

export const getHistorySnapshot = () => snapshot;
export const getServerHistorySnapshot = () => empty;
export function subscribeHistory(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
