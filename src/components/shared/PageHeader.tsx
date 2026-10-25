import type { ReactNode } from "react";

interface Props {
  title: string;
  description: string;
  eyebrow?: string;
  actions?: ReactNode;
  headingLevel?: 1 | 2;
  content?: ReactNode;
}

export function PageHeader({ title, description, eyebrow = "Seu estúdio de escrita", actions, headingLevel = 1, content }: Props) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      {content ?? <div className="min-w-0">
        <p className="editorial-eyebrow">{eyebrow}</p>
        <Heading className="editorial-heading mt-1 mb-2.5">{title}</Heading>
        <p className="text-xs leading-relaxed text-muted">{description}</p>
      </div>}
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </header>
  );
}
