"use client";

import { Select } from "@/components/ui/Select";
import { useMeasurementUnit } from "@/hooks/useMeasurementUnit";

export function MeasurementUnitSelect() {
  const { unit, setUnit } = useMeasurementUnit();

  return (
    <Select
      label="Unidade de medida"
      value={unit}
      onChange={(event) => setUnit(event.target.value === "in" ? "in" : "cm")}
      options={[
        { value: "cm", label: "Centímetros (cm)" },
        { value: "in", label: "Polegadas (in)" },
      ]}
    />
  );
}
