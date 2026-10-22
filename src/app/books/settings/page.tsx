import { Suspense } from "react";
import { RouteLoading } from "@/components/shared/RouteLoading";
import { SettingsContent } from "@/app/books/settings/SettingsContent";

export default function BookSettingsPage() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <SettingsContent />
    </Suspense>
  );
}
