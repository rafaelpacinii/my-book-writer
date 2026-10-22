import { Suspense } from "react";
import { RouteLoading } from "@/components/shared/RouteLoading";
import { EditorContent } from "@/app/books/editor/EditorContent";

export default function BookEditorPage() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <EditorContent />
    </Suspense>
  );
}
