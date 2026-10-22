import { Suspense } from "react";
import { RouteLoading } from "@/components/shared/RouteLoading";
import { ViewContent } from "@/app/books/view/ViewContent";

export default function BookViewPage() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <ViewContent />
    </Suspense>
  );
}
