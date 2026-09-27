import { Suspense } from "react";
import { EditorContent } from "./EditorContent";

export default function BookEditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <EditorContent />
    </Suspense>
  );
}
