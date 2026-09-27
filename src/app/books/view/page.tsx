import { Suspense } from "react";
import { ViewContent } from "./ViewContent";

export default function BookViewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ViewContent />
    </Suspense>
  );
}
