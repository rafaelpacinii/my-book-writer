import { invoke } from "@tauri-apps/api/core";
import type { BookFormat, FontPreset } from "@/types/catalog";

const DEFAULT_FORMATS: BookFormat[] = [
  { id: "fmt-br-14x21", name: "14 x 21 cm (Padrão Nacional)", market: "BR", width_um: 140000, height_um: 210000, is_active: true },
  { id: "fmt-br-16x23", name: "16 x 23 cm (Formato Médio)", market: "BR", width_um: 160000, height_um: 230000, is_active: true },
  { id: "fmt-br-a5", name: "A5 (14,8 x 21 cm)", market: "BR", width_um: 148000, height_um: 210000, is_active: true },
  { id: "fmt-br-bolso", name: "Bolso (10,5 x 17,5 cm)", market: "BR", width_um: 105000, height_um: 175000, is_active: true },
  { id: "fmt-us-trade-6x9", name: "Trade (6 x 9 in)", market: "US", width_um: 152400, height_um: 228600, is_active: true },
  { id: "fmt-us-digest-5.5x8.5", name: "Digest (5.5 x 8.5 in)", market: "US", width_um: 139700, height_um: 215900, is_active: true },
];

const DEFAULT_FONTS: FontPreset[] = [
  { id: "font-merriweather", name: "Merriweather (Leitura Digital)", family_name: "Merriweather", manifest_path: "fonts/merriweather/manifest.json", is_active: true },
  { id: "font-eb-garamond", name: "EB Garamond (Clássica Literária)", family_name: "EB Garamond", manifest_path: "fonts/eb-garamond/manifest.json", is_active: true },
  { id: "font-inter", name: "Inter (Sem Serifa / Técnico)", family_name: "Inter", manifest_path: "fonts/inter/manifest.json", is_active: true },
  { id: "font-libre-baskerville", name: "Libre Baskerville (Elegante Clássica)", family_name: "Libre Baskerville", manifest_path: "fonts/libre-baskerville/manifest.json", is_active: true },
  { id: "font-libre-caslon", name: "Libre Caslon Text (Tradicional Inglesa)", family_name: "Libre Caslon Text", manifest_path: "fonts/libre-caslon/manifest.json", is_active: true },
  { id: "font-crimson-pro", name: "Crimson Pro (Editorial Renascentista)", family_name: "Crimson Pro", manifest_path: "fonts/crimson-pro/manifest.json", is_active: true },
];

function isTauriEnvironment(): boolean {
  return typeof window !== "undefined" && Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}

export async function listBookFormats(): Promise<BookFormat[]> {
  if (!isTauriEnvironment()) return DEFAULT_FORMATS;
  return invoke<BookFormat[]>("list_book_formats");
}

export async function listFontPresets(): Promise<FontPreset[]> {
  if (!isTauriEnvironment()) return DEFAULT_FONTS;
  return invoke<FontPreset[]>("list_font_presets");
}
