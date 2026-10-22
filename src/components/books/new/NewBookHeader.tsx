import { PageHeader } from "@/components/shared/PageHeader";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

export function NewBookHeader() {
  return (
    <div className="flex flex-col gap-5">
      <Breadcrumbs items={[{ label: "Biblioteca", href: "/library" }, { label: "Novo livro" }]} />
      <PageHeader title="Novo livro" description="Comece pelo essencial. Você pode ajustar tudo depois." />
    </div>
  );
}
