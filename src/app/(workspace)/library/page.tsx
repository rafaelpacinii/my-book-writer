import { Suspense } from "react";
import { Main } from "@/components/library/Main";
import { RouteLoading } from "@/components/shared/RouteLoading";

export default function LibraryPage() {
  return <Suspense fallback={<RouteLoading />}><Main /></Suspense>;
}
