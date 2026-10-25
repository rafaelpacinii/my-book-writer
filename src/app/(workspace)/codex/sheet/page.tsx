import { Suspense } from "react";
import { Main } from "@/components/codex/sheet/Main";
import { RouteLoading } from "@/components/shared/RouteLoading";

export default function CodexSheetPage() {
  return <Suspense fallback={<RouteLoading />}><Main /></Suspense>;
}
