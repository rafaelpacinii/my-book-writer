import { VersionHistoryItem } from "@/components/books/versions/VersionHistoryItem";
import type { VersionCardProps } from "./types";

export function VersionCard(props: VersionCardProps) {
  return <VersionHistoryItem {...props} />;
}
