import { ShieldCheck } from "lucide-react";

export function PersistenceNotice() {
  return (
    <footer className="mt-1 flex items-center gap-2 border-t border-border pt-5 text-[10px] text-muted">
      <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
      <p>Local por princípio. Seu, por inteiro.</p>
    </footer>
  );
}
