import { expect, test } from "vitest";
import { book, font, format } from "@/tests/fixtures/book";
import { getPhysicalPageDimensions, removeLegacyPageBreaks } from "./bookPagination";
import {
  micrometersToUnit, unitToMicrometers, formatBookFormat, validateBookLayout,
  type MeasurementUnit,
} from "./bookMeasurements";

test("page geometry uses exact physical dimensions and all four margins", () => {
  const dimensions = getPhysicalPageDimensions({
    ...book, font_size_pt: 12, line_height_ratio: 1.7,
    margin_top_um: 0, margin_right_um: 15000, margin_bottom_um: 25400, margin_left_um: 22000,
  }, format, font);
  expect(dimensions.widthPx).toBe(576);
  expect(dimensions.heightPx).toBe(864);
  expect(dimensions.paddingTopPx).toBe(0);
  expect(dimensions.paddingBottomPx).toBe(96);
  expect(dimensions.textWidthPx).toBe((152400 - 15000 - 22000) * 96 / 25400);
  expect(dimensions.textHeightPx).toBe(864 - 96 - 64);
  expect(dimensions.fontSizePx).toBe(16);
  expect(dimensions.lineHeight).toBe(1.7);
  expect(dimensions.fontFamily).toBe("Inter");
});

test("changing book settings changes layout geometry", () => {
  const initial = getPhysicalPageDimensions();
  const changed = getPhysicalPageDimensions({
    ...book, font_size_pt: 18, margin_top_um: 30000, margin_bottom_um: 30000,
    margin_left_um: 25000, margin_right_um: 25000,
  }, { ...format, width_um: 105000, height_um: 175000 });
  expect(changed.textWidthPx).toBeLessThan(initial.textWidthPx);
  expect(changed.textHeightPx).toBeLessThan(initial.textHeightPx);
  expect(changed.fontSizePx).toBeGreaterThan(initial.fontSizePx);
});

test("cm/in conversion round trips preserve persisted micrometers", () => {
  const units: MeasurementUnit[] = ["cm", "in"];
  for (const unit of units) {
    for (const value of [0, 5000, 12700, 20321, 25400, 60000, 139700]) {
      expect(unitToMicrometers(micrometersToUnit(value, unit), unit)).toBe(value);
    }
  }
  expect(unitToMicrometers(1, "in")).toBe(25400);
  expect(unitToMicrometers(2.54, "cm")).toBe(25400);
});

test("format labels consistently use the selected unit without rounding A5", () => {
  const a5 = { ...format, name: "A5 (14,8 x 21 cm)", width_um: 148000, height_um: 210000 };
  expect(formatBookFormat(a5, "cm")).toBe("14,8 × 21 cm (A5)");
  expect(formatBookFormat(a5, "in")).not.toContain("cm");
});

test("legacy automatic page markers do not lock text to old pages", () => {
  const content = '<p><strong>Texto</strong></p><div data-page-break="true" style="display:none"></div><blockquote>Continuação</blockquote>';
  expect(removeLegacyPageBreaks(content)).toBe("<p><strong>Texto</strong></p><blockquote>Continuação</blockquote>");
});

test("invalid margins cannot erase the printable text area", () => {
  expect(validateBookLayout(undefined, 11, 1.4, [20, 20, 20, 20])).toBeNull();
  expect(validateBookLayout({ ...format, width_um: 105000, height_um: 175000 }, 11, 1.4, [20, 60, 20, 60])).not.toBeNull();
  expect(validateBookLayout(undefined, NaN, 1.4, [20, 20, 20, 20])).not.toBeNull();
});
