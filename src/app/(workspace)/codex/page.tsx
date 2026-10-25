import { Suspense } from "react";
import { Main } from "@/components/codex/Main";
import { RouteLoading } from "@/components/shared/RouteLoading";

export default function CodexPage() {
  return <Suspense fallback={<RouteLoading />}><Main /></Suspense>;
}
