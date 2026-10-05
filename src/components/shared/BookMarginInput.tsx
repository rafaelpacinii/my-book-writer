"use client";

import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { useMeasurementUnit } from "@/hooks/useMeasurementUnit";
import { micrometersToUnit, unitToMicrometers } from "@/utils/bookMeasurements";

interface Props {
  label: string;
  valueMm: number;
  onChange: (valueMm: number) => void;
}

export function BookMarginInput({ label, valueMm, onChange }: Props) {
  const { unit } = useMeasurementUnit();
  const displayValue = Number(micrometersToUnit(valueMm * 1000, unit).toFixed(4));
  const [draft, setDraft] = useState({ unit, valueMm, text: String(displayValue) });
  const value = draft.unit === unit && draft.valueMm === valueMm ? draft.text : String(displayValue);

  return (
    <Input
      label={`${label} (${unit})`}
      type="number"
      required
      step="any"
      min={micrometersToUnit(5000, unit)}
      max={micrometersToUnit(60000, unit)}
      value={value}
      onChange={(event) => {
        const text = event.target.value;
        const nextMm = unitToMicrometers(Number(text), unit) / 1000;
        setDraft({ unit, valueMm: nextMm, text });
        onChange(nextMm);
      }}
    />
  );
}
