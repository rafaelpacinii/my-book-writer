import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
}

export function CodexEmpty({ icon: Icon, title, description, children }: Props) {
  return (
    <section className="flex flex-col items-center rounded-xl border border-border bg-surface px-7 py-10 text-center">
      <Icon aria-hidden="true" className="mb-5 text-primary" size={36} strokeWidth={1.5} />
      <h2 className="font-display text-[32px] leading-tight">{title}</h2>
      <p className="mt-2 text-xs leading-relaxed text-muted">{description}</p>
      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}
