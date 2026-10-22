import { Suspense } from "react";
import { RouteLoading } from "@/components/shared/RouteLoading";
import { FrontMatterContent } from "@/app/(workspace)/books/front-matter/FrontMatterContent";

export default function FrontMatterPage() {
  return <Suspense fallback={<RouteLoading />}><FrontMatterContent /></Suspense>;
}
