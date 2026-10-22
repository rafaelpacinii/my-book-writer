import Link from "next/link";
import { BookOpen, ShieldCheck } from "lucide-react";

export function SidebarFooter({ onNavigate }: { onNavigate: () => void }) {
  return (
    <footer className="shrink-0 border-t border-border pt-5">
      <Link data-sidebar-item href="/home" onClick={onNavigate} aria-label="my book writer — início"
        className="flex items-center gap-2.5 rounded-md px-2 py-2 text-muted hover:text-foreground"
      >
        <BookOpen className="h-5 w-5 shrink-0" strokeWidth={1.5} />
        <span data-sidebar-expanded className="font-display text-[20px] leading-none">my book writer.</span>
      </Link>
      <p data-sidebar-expanded className="mt-2 flex items-center gap-1.5 px-2 text-[10px] text-muted">
        <ShieldCheck className="h-3 w-3 shrink-0" />Seu espaço, mesmo sem internet.
      </p>
    </footer>
  );
}
