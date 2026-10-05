import assert from "node:assert/strict";
import test from "node:test";
import { getPhysicalPageDimensions, removeLegacyPageBreaks } from "./bookPagination.ts";
import {
  micrometersToUnit, unitToMicrometers, formatBookFormat, validateBookLayout,
} from "./bookMeasurements.ts";

test("page geometry uses exact physical dimensions and all four margins", () => {
  const dimensions = getPhysicalPageDimensions({
    font_size_pt: 12, line_height_ratio: 1.7,
    margin_top_um: 0, margin_right_um: 15000, margin_bottom_um: 25400, margin_left_um: 22000,
  }, { width_um: 152400, height_um: 228600 }, { family_name: "Inter" });
  assert.equal(dimensions.widthPx, 576);
  assert.equal(dimensions.heightPx, 864);
  assert.equal(dimensions.paddingTopPx, 0);
  assert.equal(dimensions.paddingBottomPx, 96);
  assert.equal(dimensions.textWidthPx, (152400 - 15000 - 22000) * 96 / 25400);
  assert.equal(dimensions.textHeightPx, 864 - 96 - 64);
  assert.equal(dimensions.fontSizePx, 16);
  assert.equal(dimensions.lineHeight, 1.7);
  assert.equal(dimensions.fontFamily, "Inter");
});

test("changing book settings changes layout geometry", () => {
  const initial = getPhysicalPageDimensions();
  const changed = getPhysicalPageDimensions({
    font_size_pt: 18, margin_top_um: 30000, margin_bottom_um: 30000,
    margin_left_um: 25000, margin_right_um: 25000,
  }, { width_um: 105000, height_um: 175000 });
  assert(changed.textWidthPx < initial.textWidthPx);
  assert(changed.textHeightPx < initial.textHeightPx);
  assert(changed.fontSizePx > initial.fontSizePx);
});

test("cm/in conversion round trips preserve persisted micrometers", () => {
  for (const unit of ["cm", "in"]) {
    for (const value of [0, 5000, 12700, 20321, 25400, 60000, 139700]) {
      assert.equal(unitToMicrometers(micrometersToUnit(value, unit), unit), value);
    }
  }
  assert.equal(unitToMicrometers(1, "in"), 25400);
  assert.equal(unitToMicrometers(2.54, "cm"), 25400);
});

test("format labels consistently use the selected unit without rounding A5", () => {
  const format = { name: "A5 (14,8 x 21 cm)", width_um: 148000, height_um: 210000 };
  assert.equal(formatBookFormat(format, "cm"), "14,8 × 21 cm (A5)");
  assert(!formatBookFormat(format, "in").includes("cm"));
});

test("legacy automatic page markers do not lock text to old pages", () => {
  const content = '<p><strong>Texto</strong></p><div data-page-break="true" style="display:none"></div><blockquote>Continuação</blockquote>';
  assert.equal(removeLegacyPageBreaks(content), "<p><strong>Texto</strong></p><blockquote>Continuação</blockquote>");
});

test("invalid margins cannot erase the printable text area", () => {
  assert.equal(validateBookLayout(undefined, 11, 1.4, [20, 20, 20, 20]), null);
  assert(validateBookLayout({ width_um: 105000, height_um: 175000 }, 11, 1.4, [20, 60, 20, 60]));
  assert(validateBookLayout(undefined, NaN, 1.4, [20, 20, 20, 20]));
});
