import { VersionHistoryItem } from "./VersionHistoryItem";
import type { ComponentProps } from "react";

export function VersionsSidebarItem(props: ComponentProps<typeof VersionHistoryItem>) {
  return <VersionHistoryItem {...props} />;
}
