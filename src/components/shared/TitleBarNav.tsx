"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTitleBarCrumbs } from "@/hooks/useTitleBarCrumbs";

export function TitleBarNav() {
  const crumbs = useTitleBarCrumbs();
  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Caminho contextual" className="titlebar-nav">
      <ol className="titlebar-crumbs">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={`${index}-${crumb.label}`} className="titlebar-crumb-item">
              {index > 0 && (
                <ChevronRight size={11} className="titlebar-chevron" aria-hidden="true" />
              )}
              {crumb.href && !isLast ? (
                <Link href={crumb.href} className="titlebar-link">
                  {crumb.label}
                </Link>
              ) : (
                <span className="titlebar-current" aria-current={isLast ? "page" : undefined}>
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

