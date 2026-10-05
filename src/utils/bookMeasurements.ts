import type { BookFormat } from "@/types/catalog";

export type MeasurementUnit = "cm" | "in";

export function micrometersToUnit(value: number, unit: MeasurementUnit): number {
  return value / (unit === "cm" ? 10000 : 25400);
}

export function unitToMicrometers(value: number, unit: MeasurementUnit): number {
  return Math.round(value * (unit === "cm" ? 10000 : 25400));
}

export function formatMeasurement(valueUm: number, unit: MeasurementUnit): string {
  return micrometersToUnit(valueUm, unit).toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

export function formatBookSize(widthUm: number, heightUm: number, unit: MeasurementUnit): string {
  return `${formatMeasurement(widthUm, unit)} × ${formatMeasurement(heightUm, unit)} ${unit}`;
}

export function formatBookFormat(format: BookFormat, unit: MeasurementUnit): string {
  const name = format.name
    .replace(/\d+(?:[.,]\d+)?\s*[x×]\s*\d+(?:[.,]\d+)?\s*(cm|in)/gi, "")
    .replace(/[()]/g, "").trim();
  const size = formatBookSize(format.width_um, format.height_um, unit);
  return name ? `${size} (${name})` : size;
}

export function validateBookLayout(
  format: BookFormat | undefined,
  fontSizePt: number,
  lineHeight: number,
  marginsMm: [number, number, number, number],
): string | null {
  if (![fontSizePt, lineHeight, ...marginsMm].every(Number.isFinite)
    || fontSizePt <= 0 || lineHeight < 1 || marginsMm.some((margin) => margin < 0)) {
    return "Informe valores válidos para fonte, entrelinha e margens.";
  }
  const [top, right, bottom, left] = marginsMm;
  const fontSizeUm = fontSizePt * 25400 / 72;
  const availableWidth = (format?.width_um ?? 140000) - (left + right) * 1000;
  const availableHeight = (format?.height_um ?? 210000) - (top + bottom) * 1000;
  if (availableWidth < fontSizeUm || availableHeight < fontSizeUm * (4 + lineHeight * 2)) {
    return "As margens e a fonte deixam pouco espaço para o texto neste formato de livro.";
  }
  return null;
}
