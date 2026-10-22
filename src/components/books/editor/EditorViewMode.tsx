interface Props {
  value: "continuous" | "paged";
  onChange: (mode: "continuous" | "paged") => void;
}

export function EditorViewMode({ value, onChange }: Props) {
  return (
    <div role="group" aria-label="Visualização do editor" className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
      {([{ value: "continuous", label: "Contínuo" }, { value: "paged", label: "Paginado" }] as const).map((mode) => (
        <button key={mode.value} type="button" aria-pressed={value === mode.value} onClick={() => onChange(mode.value)}
          className={`min-h-7 rounded-md px-2 text-xs ${value === mode.value ? "bg-primary-soft font-medium text-primary" : "text-muted hover:bg-surface-hover hover:text-foreground"}`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
