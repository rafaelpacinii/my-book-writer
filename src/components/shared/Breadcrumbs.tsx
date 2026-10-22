import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Caminho de navegação" className="min-w-0 text-xs text-muted">
      <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => (
          <li key={`${index}-${item.label}`} className="flex min-w-0 items-center gap-2">
            {index > 0 && <ChevronRight aria-hidden="true" className="h-3 w-3 shrink-0" />}
            {item.href ? (
              <Link href={item.href} className="min-w-0 wrap-anywhere rounded-sm hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span aria-current={index === items.length - 1 ? "page" : undefined}
                className="min-w-0 wrap-anywhere text-foreground"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
