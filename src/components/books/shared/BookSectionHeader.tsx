import { BookBreadcrumbs } from "@/components/shared/BookBreadcrumbs";

interface Props {
  bookId: string;
  bookTitle?: string;
  current: string;
  title: string;
  description: string;
}

export function BookSectionHeader({ bookId, bookTitle, current, title, description }: Props) {
  return (
    <header className="mb-6 select-none">
      <div className="mb-4"><BookBreadcrumbs bookId={bookId} bookTitle={bookTitle} current={current} /></div>
      <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground lg:text-[32px]">{title}</h1>
      <p className="mt-1.5 text-base font-normal text-muted">{description}</p>
    </header>
  );
}
