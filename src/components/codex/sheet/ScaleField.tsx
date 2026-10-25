import { useId } from "react";
import { Input } from "@/components/ui/Input";
import type { FieldValueProps } from "@/components/codex/sheet/FieldValue";

export function ScaleField({ field, disabled, change }: FieldValueProps) {
  const id = useId();
  const value = typeof field.value === "number" ? field.value : 0;
  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={id} className="flex justify-between gap-3 text-xs font-bold text-foreground">
        <span className="break-words">{field.label}</span><span className="shrink-0 tabular-nums">{value} / 100</span>
      </label>
      <input id={id} type="range" min={0} max={100} step={1} value={value} disabled={disabled}
        onChange={(event) => change(Number(event.target.value))} className="w-full accent-primary" />
      <Input type="number" aria-label={`${field.label} (valor)`} min={0} max={100} step="any" value={value} disabled={disabled}
        onChange={(event) => change(Number(event.target.value))} />
    </div>
  );
}
