import { Suspense } from "react";
import { SettingsContent } from "./SettingsContent";

export default function BookSettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SettingsContent />
    </Suspense>
  );
}
