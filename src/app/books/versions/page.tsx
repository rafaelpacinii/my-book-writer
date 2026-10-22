import { Suspense } from "react";
import { RouteLoading } from "@/components/shared/RouteLoading";
import { VersionsContent } from "@/app/books/versions/VersionsContent";

export default function BookVersionsPage() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <VersionsContent />
    </Suspense>
  );
}

