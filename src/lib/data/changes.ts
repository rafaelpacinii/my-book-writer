export type DataChange = "books" | "covers" | "profile" | "restore" | "series" | "universes";
const listeners = new Set<(change: DataChange) => void>();

export function publishDataChange(change: DataChange) {
  listeners.forEach((listener) => listener(change));
}

export function subscribeDataChanges(listener: (change: DataChange) => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
