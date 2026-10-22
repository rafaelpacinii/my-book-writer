export interface ResourceSnapshot<T> {
  data: T | undefined;
  error: string | null;
  isRefreshing: boolean;
}

/** Session cache: persistence stays in the API/native layer. */
export function createResource<T>(loader: () => Promise<T>) {
  const initial: ResourceSnapshot<T> = { data: undefined, error: null, isRefreshing: false };
  let snapshot = initial;
  let stale = true;
  let generation = 0;
  let pending: Promise<void> | undefined;
  const listeners = new Set<() => void>();
  const publish = (next: ResourceSnapshot<T>) => {
    snapshot = next;
    listeners.forEach((listener) => listener());
  };

  const load = (force = false): Promise<void> => {
    if (pending) return pending;
    if (!force && !stale) return Promise.resolve();
    const request = ++generation;
    stale = false;
    publish({ ...snapshot, error: null, isRefreshing: true });
    pending = Promise.resolve().then(loader).then((data) => {
      if (request === generation) publish({ data, error: null, isRefreshing: false });
    }).catch((error: unknown) => {
      if (request === generation) {
        publish({ ...snapshot, error: error instanceof Error ? error.message : String(error), isRefreshing: false });
      }
    }).finally(() => {
      if (request === generation) pending = undefined;
    });
    return pending;
  };

  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => initial,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    load,
    isObserved: () => listeners.size > 0,
    set(data: T) {
      generation++;
      pending = undefined;
      stale = false;
      publish({ data, error: null, isRefreshing: false });
    },
    fail(error: string) {
      generation++;
      pending = undefined;
      stale = false;
      publish({ data: undefined, error, isRefreshing: false });
    },
    invalidate(clear = false) {
      generation++;
      pending = undefined;
      stale = true;
      publish({ data: clear ? undefined : snapshot.data, error: null, isRefreshing: false });
      if (listeners.size) void load();
    },
  };
}
