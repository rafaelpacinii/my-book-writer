"use client";

import { Select } from "@/components/ui/Select";
import { MeasurementUnitSelect } from "./MeasurementUnitSelect";
import { useMeasurementUnit } from "@/hooks/useMeasurementUnit";
import { formatBookFormat } from "@/utils/bookMeasurements";
import type { BookFormat, FontPreset } from "@/types/catalog";

interface Props {
  formatId: string;
  setFormatId: (value: string) => void;
  formats: BookFormat[];
  fontId: string;
  setFontId: (value: string) => void;
  fonts: FontPreset[];
}

export function BookTypographyFields(props: Props) {
  const { unit } = useMeasurementUnit();

  return (
    <>
      <MeasurementUnitSelect />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Formato"
          value={props.formatId}
          onChange={(event) => props.setFormatId(event.target.value)}
          options={props.formats.map((format) => ({
            value: format.id,
            label: formatBookFormat(format, unit),
          }))}
        />
        <Select
          label="Fonte"
          value={props.fontId}
          onChange={(event) => props.setFontId(event.target.value)}
          options={props.fonts.map((font) => ({ value: font.id, label: font.name }))}
        />
      </div>
    </>
  );
}
