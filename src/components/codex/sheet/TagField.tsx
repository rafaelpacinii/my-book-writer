import { Input } from "@/components/ui/Input";
import { useCodexTagInput } from "@/hooks/useCodexTagInput";
import type { FieldValueProps } from "@/components/codex/sheet/FieldValue";

export function TagField({ field, disabled, change }: FieldValueProps) {
  const input = useCodexTagInput(field.value, change);
  return (
    <div>
      <Input label={field.label} value={input.text} disabled={disabled} hint="Separe as tags por vírgulas. Até 100 tags por campo."
        onChange={(event) => input.change(event.target.value)} />
      <div role="list" aria-label={`Tags de ${field.label}`} className="mt-3 flex flex-wrap gap-2">
        {Array.isArray(field.value) && field.value.map((tag, index) => (
          <span key={index} role="listitem" className="max-w-full break-words rounded-md bg-primary-soft px-2 py-1 text-xs text-foreground">{String(tag)}</span>
        ))}
      </div>
    </div>
  );
}
