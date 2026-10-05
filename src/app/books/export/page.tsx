import { Suspense } from "react";
import { ExportContent } from "@/components/books/export/ExportContent";

export default function BookExportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ExportContent />
    </Suspense>
  );
}
