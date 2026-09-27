/**
 * Representa um formato físico de livro pré-definido no catálogo (`book_formats`).
 * As medidas width_um e height_um estão em micrômetros (1 mm = 1.000 µm).
 */
export interface BookFormat {
  id: string;
  name: string;
  market: string;
  width_um: number;
  height_um: number;
  is_active: boolean;
}

/**
 * Representa um preset de família tipográfica embutida no aplicativo (`font_presets`).
 */
export interface FontPreset {
  id: string;
  name: string;
  family_name: string;
  manifest_path: string;
  is_active: boolean;
}
