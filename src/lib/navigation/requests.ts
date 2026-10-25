export const HISTORY_NAVIGATION_EVENT = "mbw-history-navigation";

/** Give active forms/editors the chance to confirm or save before traversing history. */
export function requestHistoryNavigation(direction: -1 | 1) {
  const proceed = () => history.go(direction);
  const event = new CustomEvent(HISTORY_NAVIGATION_EVENT, { cancelable: true, detail: proceed });
  if (window.dispatchEvent(event)) proceed();
}
