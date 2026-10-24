interface Props {
  title: string;
  description: string;
}

export function BookSectionHeader({ title, description }: Props) {
  return (
    <header className="mb-6 select-none">
      <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground lg:text-[32px]">{title}</h1>
      <p className="mt-1.5 text-base font-normal text-muted">{description}</p>
    </header>
  );
}
