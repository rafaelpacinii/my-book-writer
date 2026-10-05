import type { Book } from "@/types/book";
import type { BookFormat, FontPreset } from "@/types/catalog";

const CSS_PX_PER_UM = 96 / 25400;

export interface PageDimensions {
  widthPx: number;
  heightPx: number;
  paddingTopPx: number;
  paddingBottomPx: number;
  paddingLeftPx: number;
  paddingRightPx: number;
  textWidthPx: number;
  textHeightPx: number;
  runningMatterHeightPx: number;
  fontSizePx: number;
  lineHeight: number;
  fontFamily: string;
  widthUm: number;
  heightUm: number;
}

export function getPhysicalPageDimensions(
  book?: Book | null,
  format?: BookFormat,
  font?: FontPreset,
): PageDimensions {
  const widthUm = format?.width_um ?? 140000;
  const heightUm = format?.height_um ?? 210000;
  const widthPx = widthUm * CSS_PX_PER_UM;
  const heightPx = heightUm * CSS_PX_PER_UM;
  const paddingTopPx = (book?.margin_top_um ?? 20000) * CSS_PX_PER_UM;
  const paddingBottomPx = (book?.margin_bottom_um ?? 20000) * CSS_PX_PER_UM;
  const paddingLeftPx = (book?.margin_left_um ?? 20000) * CSS_PX_PER_UM;
  const paddingRightPx = (book?.margin_right_um ?? 20000) * CSS_PX_PER_UM;
  const fontSizePx = (book?.font_size_pt ?? 11) * 96 / 72;
  const runningMatterHeightPx = fontSizePx * 2;

  return {
    widthPx, heightPx, paddingTopPx, paddingBottomPx,
    paddingLeftPx, paddingRightPx, fontSizePx, runningMatterHeightPx,
    textWidthPx: Math.max(1, widthPx - paddingLeftPx - paddingRightPx),
    textHeightPx: Math.max(1, heightPx - paddingTopPx - paddingBottomPx - 2 * runningMatterHeightPx),
    lineHeight: book?.line_height_ratio ?? 1.4,
    fontFamily: font?.family_name ?? "Merriweather",
    widthUm, heightUm,
  };
}

// Old automatic breaks were saved as content. Reflow them using the actual layout.
export function removeLegacyPageBreaks(html: string): string {
  return html.replace(/<div\b[^>]*\bdata-page-break=["']true["'][^>]*>\s*<\/div>/gi, "");
}
