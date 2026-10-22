import { Suspense } from "react";
import { RouteLoading } from "@/components/shared/RouteLoading";
import { ExportContent } from "@/components/books/export/ExportContent";

export default function BookExportPage() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <ExportContent />
    </Suspense>
  );
}
