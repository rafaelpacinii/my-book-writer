import type { BookSeries } from "@/types/series";
import type { Universe } from "@/types/universe";

export function newBookCollectionInput(seriesId: string, universeId: string, series: BookSeries[], universes: Universe[]) {
  if (seriesId && !series.some((item) => item.id === seriesId)) {
    throw new Error("A série selecionada não está disponível. Escolha outra série ou um livro avulso.");
  }
  if (universeId && !universes.some((item) => item.id === universeId)) {
    throw new Error("O universo selecionado não está disponível. Escolha outro universo ou nenhum.");
  }
  return { series_id: seriesId || null, universe_id: universeId || null };
}
