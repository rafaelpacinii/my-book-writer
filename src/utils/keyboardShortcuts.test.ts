import { describe, expect, it } from "vitest";
import { formatShortcutLabel, matchesShortcut } from "./keyboardShortcuts";

describe("keyboardShortcuts", () => {
  it("formats shortcuts appropriately", () => {
    const formatted = formatShortcutLabel("mod+s");
    expect(formatted).toContain("S");
  });

  it("matches simple shortcut like mod+s", () => {
    const event = {
      key: "s",
      ctrlKey: true,
      shiftKey: false,
      altKey: false,
    };
    expect(matchesShortcut(event, "mod+s")).toBe(true);
    expect(matchesShortcut(event, "mod+shift+s")).toBe(false);
  });

  it("matches complex shortcut with shift and alt", () => {
    const event = {
      key: "f",
      ctrlKey: true,
      shiftKey: true,
      altKey: false,
    };
    expect(matchesShortcut(event, "mod+shift+f")).toBe(true);
    expect(matchesShortcut(event, "mod+f")).toBe(false);
  });
});

