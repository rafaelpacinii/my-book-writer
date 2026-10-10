import { Suspense } from "react";
import { PreviewContent } from "./PreviewContent";

export default function BookPreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PreviewContent />
    </Suspense>
  );
}

