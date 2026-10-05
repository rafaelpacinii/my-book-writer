"use client";

import type { Book } from "@/types/book";
import type { PageDimensions } from "@/utils/bookPagination";
import { formatBookSize, formatMeasurement } from "@/utils/bookMeasurements";
import { useMeasurementUnit } from "@/hooks/useMeasurementUnit";

interface Props {
  book: Book | null;
  dimensions: PageDimensions;
}

export function EditorPageLayoutInfo({ book, dimensions }: Props) {
  const { unit } = useMeasurementUnit();
  const margins = [book?.margin_top_um, book?.margin_right_um, book?.margin_bottom_um, book?.margin_left_um]
    .map((value) => formatMeasurement(value ?? 20000, unit)).join(" / ");

  return (
    <p className="text-xs text-muted mt-2 select-none text-center">
      {formatBookSize(dimensions.widthUm, dimensions.heightUm, unit)} · margens {margins} {unit}
      {" · "}{dimensions.fontFamily} {book?.font_size_pt ?? 11} pt
    </p>
  );
}
