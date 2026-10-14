export function isMac(): boolean {
  if (typeof window === "undefined") return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
}

export function formatShortcutLabel(shortcut: string): string {
  if (!shortcut) return "";
  const mac = isMac();
  const parts = shortcut.toLowerCase().split("+");

  return parts
    .map((part) => {
      switch (part) {
        case "mod":
          return mac ? "⌘" : "Ctrl";
        case "shift":
          return mac ? "⇧" : "Shift";
        case "alt":
          return mac ? "⌥" : "Alt";
        default:
          return part.toUpperCase();
      }
    })
    .join(mac ? "" : " + ");
}

export type ShortcutEventLike = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
};

export function matchesShortcut(
  event: ShortcutEventLike,
  shortcut: string,
): boolean {
  if (!shortcut) return false;
  const parts = shortcut.toLowerCase().split("+");
  const key = parts[parts.length - 1];

  const needsMod = parts.includes("mod");
  const needsShift = parts.includes("shift");
  const needsAlt = parts.includes("alt");

  const isModPressed = Boolean(event.ctrlKey || event.metaKey);
  const isShiftPressed = Boolean(event.shiftKey);
  const isAltPressed = Boolean(event.altKey);

  if (needsMod !== isModPressed) return false;
  if (needsShift !== isShiftPressed) return false;
  if (needsAlt !== isAltPressed) return false;

  return event.key.toLowerCase() === key.toLowerCase();
}
