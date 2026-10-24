import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { BookSeries } from "@/types/series";

interface Props {
  series: BookSeries[];
  value: string;
  onChange: (id: string) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  disabled?: boolean;
}

export function BookSeriesSelect({ series, value, onChange, isLoading, error, onRetry, disabled }: Props) {
  const unavailable = Boolean(value && !series.some((item) => item.id === value));
  return (
    <div className="flex flex-col gap-2">
      <Select label="Série" value={value} onChange={(event) => onChange(event.target.value)}
        disabled={disabled || isLoading || Boolean(error)}
        hint="O volume é numerado automaticamente. Gerencie suas séries na Biblioteca.">
        <option value="">Livro avulso (sem série)</option>
        {unavailable && <option value={value}>Série indisponível</option>}
        {series.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </Select>
      {isLoading && <p role="status" className="text-xs text-muted">Carregando séries…</p>}
      {error && (
        <div role="alert" className="text-sm text-danger">
          <p>{error}</p>
          <Button type="button" variant="outline" onClick={onRetry}>Tentar carregar séries novamente</Button>
        </div>
      )}
    </div>
  );
}
