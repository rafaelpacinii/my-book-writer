import { Orbit } from "lucide-react";
import { BookSeriesSelect } from "@/components/shared/BookSeriesSelect";
import { Select } from "@/components/ui/Select";
import type { useNewBookForm } from "@/hooks/useNewBookForm";

export function NewBookCollections({ form }: { form: ReturnType<typeof useNewBookForm> }) {
  const unavailable = Boolean(form.universeId && !form.universeData.universes.some((item) => item.id === form.universeId));
  return (
    <>
      <BookSeriesSelect series={form.seriesData.series} value={form.seriesId} onChange={form.setSeriesId}
        isLoading={form.seriesData.isLoading} error={form.seriesData.error}
        onRetry={() => { void form.seriesData.refreshSeries(); }} />
      <Select label="Universo" icon={Orbit} value={form.universeId} disabled={form.isUniverseInherited}
        onChange={(event) => form.setUniverseId(event.target.value)}
        hint={form.isUniverseInherited ? "Este livro acompanha o universo da série selecionada." : "Opcional. Compartilhe um mundo com outros livros e séries."}>
        <option value="">Sem universo</option>
        {unavailable && <option value={form.universeId}>Universo indisponível</option>}
        {form.universeData.universes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </Select>
    </>
  );
}
