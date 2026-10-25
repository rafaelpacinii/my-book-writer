import type { CodexSheet } from "@/types/codex";

function valueOf(field: CodexSheet["fields"][number]): string {
  try {
    const value: unknown = JSON.parse(field.value_json);
    if (field.field_type === "reference") return Array.isArray(value) && value.length ? `${value.length} vínculo(s)` : "Não informado";
    if (field.field_type === "document") return "Documento narrativo";
    if (Array.isArray(value)) return value.join(", ") || "Não informado";
    if (typeof value === "number") return `${value} / 100`;
    return typeof value === "string" && value.trim() ? value : "Não informado";
  } catch { return "Conteúdo indisponível"; }
}
export function SheetFields({ sheet }: { sheet: CodexSheet }) {
  return (
    <section className="min-w-0 rounded-xl border border-border bg-surface p-6" aria-label="Dados da ficha">
      <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-foreground">Dados da ficha</h2>
      <div className="space-y-7">
        {sheet.categories.map((category) => (
          <section key={category.id} aria-label={category.name}>
            <h3 className="mb-4 break-words border-b border-border pb-2 font-bold text-foreground">{category.name}</h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {sheet.fields.filter((field) => field.category_id === category.id).map((field) => (
                <div key={field.id} className={field.field_type === "long_text" ? "sm:col-span-2" : ""}>
                  <dt className="mb-1 break-words text-xs font-semibold text-muted">{field.label}</dt>
                  <dd className="whitespace-pre-wrap break-words text-sm text-foreground">{valueOf(field)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        {!sheet.categories.length && <p className="text-sm text-muted">Esta ficha ainda não possui categorias.</p>}
      </div>
    </section>
  );
}
