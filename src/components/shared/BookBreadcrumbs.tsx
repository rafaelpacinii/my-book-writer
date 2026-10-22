import { Breadcrumbs, type BreadcrumbItem } from "@/components/shared/Breadcrumbs";

interface Props {
  bookId: string;
  bookTitle?: string;
  current?: string;
  ancestors?: BreadcrumbItem[];
}

export function BookBreadcrumbs({ bookId, bookTitle, current, ancestors = [] }: Props) {
  return (
    <Breadcrumbs items={[
      { label: "Biblioteca", href: "/library" },
      ...(bookId ? [{
        label: bookTitle || "Livro",
        href: current ? `/books/view?bookId=${encodeURIComponent(bookId)}` : undefined,
      }] : []),
      ...ancestors,
      ...(current ? [{ label: current }] : []),
    ]} />
  );
}
