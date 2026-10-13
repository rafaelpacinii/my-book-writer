import { Suspense } from "react";
import { VersionsContent } from "./VersionsContent";

export default function BookVersionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <VersionsContent />
    </Suspense>
  );
}

