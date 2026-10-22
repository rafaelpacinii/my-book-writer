import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-danger bg-danger-soft p-5 text-danger">
      <AlertCircle aria-hidden="true" className="h-5 w-5 shrink-0" />
      <p className="min-w-0 flex-1 text-sm">{message}</p>
      <Button variant="outline" type="button" onClick={onRetry}>Tentar novamente</Button>
    </div>
  );
}
