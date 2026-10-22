import type { ReactNode } from "react";

interface Props {
  title: string;
  description: string;
  eyebrow?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, eyebrow = "Seu estúdio de escrita", actions }: Props) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="editorial-eyebrow">{eyebrow}</p>
        <h1 className="editorial-heading mt-1 mb-2.5">{title}</h1>
        <p className="text-xs leading-relaxed text-muted">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </header>
  );
}
