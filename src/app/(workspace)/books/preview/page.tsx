import { Suspense } from "react";
import { RouteLoading } from "@/components/shared/RouteLoading";
import { PreviewContent } from "@/app/(workspace)/books/preview/PreviewContent";

export default function BookPreviewPage() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <PreviewContent />
    </Suspense>
  );
}

