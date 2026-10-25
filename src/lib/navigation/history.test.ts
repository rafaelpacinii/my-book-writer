import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getHistorySnapshot, trackAppHistory } from "@/lib/navigation/history";

const cleanups: (() => void)[] = [];

beforeEach(() => {
  const states: unknown[] = [{ __NA: true }];
  const storage = new Map<string, string>();
  let position = 0;
  const events = new EventTarget();
  vi.stubGlobal("window", events);
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  vi.stubGlobal("history", {
    get state() { return states[position]; },
    pushState: (value: unknown) => {
      states.splice(position + 1, states.length, structuredClone(value));
      position++;
    },
    replaceState: (value: unknown) => { states[position] = structuredClone(value); },
    go: (delta: number) => {
      position += delta;
      events.dispatchEvent(Object.assign(new Event("popstate"), { state: states[position] }));
    },
  });
});

afterEach(() => {
  cleanups.reverse().forEach((cleanup) => cleanup());
  cleanups.length = 0;
  vi.unstubAllGlobals();
});

function installTracker() {
  const cleanup = trackAppHistory();
  cleanups.push(cleanup);
  return cleanup;
}

/** The router can keep references to wrapped methods after React replays effects. */
function installRouterWrapper() {
  const push = history.pushState;
  const replace = history.replaceState;
  history.pushState = (...args) => push.apply(history, args);
  history.replaceState = (...args) => replace.apply(history, args);
}

function traverse(delta: number) {
  history.go(delta);
  history.replaceState({ ...history.state, __NA: true }, "");
}

describe("application history restoration", () => {
  it("starts a fresh tracked chain instead of restoring corrupted legacy indices", () => {
    sessionStorage.setItem("mbw_navigation_history", JSON.stringify({ session: "legacy", last: 3 }));
    history.replaceState({ __NA: true, mbw_navigation_history: { session: "legacy", index: 3 } }, "");
    installTracker();
    expect(getHistorySnapshot()).toEqual({ canBack: false, canForward: false });
    history.pushState({ __NA: true }, "", "/library");
    traverse(-1);
    expect(getHistorySnapshot()).toEqual({ canBack: false, canForward: true });
  });

  it("keeps forward destinations after repeated traversals when effects are replayed", () => {
    const unmount = installTracker();
    installRouterWrapper();
    unmount();
    installTracker();
    history.pushState({ __NA: true }, "", "/library");
    history.pushState({ __NA: true }, "", "/books/view");
    for (let round = 0; round < 3; round++) {
      traverse(-1);
      expect(getHistorySnapshot()).toEqual({ canBack: true, canForward: true });
      traverse(1);
      expect(getHistorySnapshot()).toEqual({ canBack: true, canForward: false });
    }
  });

  it("retired wrappers delegate without changing state after cleanup", () => {
    const unmount = installTracker();
    installRouterWrapper();
    unmount();
    const state = { __NA: true, custom: "preserved" };
    history.pushState(state, "", "/library");
    expect(history.state).toEqual(state);
    history.replaceState({ ...state, custom: "updated" }, "");
    expect(history.state).toEqual({ ...state, custom: "updated" });
  });

  it("restores the target index when the router writes before the popstate listener", () => {
    window.addEventListener("popstate", () => history.replaceState({ __NA: true }, ""));
    installTracker();
    history.pushState({ __NA: true }, "", "/library");
    history.pushState({ __NA: true }, "", "/books/view");
    for (let round = 0; round < 3; round++) {
      traverse(-1);
      expect(getHistorySnapshot()).toEqual({ canBack: true, canForward: true });
      traverse(1);
      expect(getHistorySnapshot()).toEqual({ canBack: true, canForward: false });
    }
  });
});
