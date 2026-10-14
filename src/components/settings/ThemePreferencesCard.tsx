import React from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemePreferencesCard() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-5 rounded-xl border border-border bg-surface flex flex-col gap-4">
      <h3 className="text-sm font-bold text-foreground">Aparência e Tema</h3>
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: "system" as const, label: "Sistema", icon: <Laptop className="w-4 h-4" /> },
          { id: "light" as const, label: "Claro", icon: <Sun className="w-4 h-4" /> },
          { id: "dark" as const, label: "Escuro", icon: <Moon className="w-4 h-4" /> },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              theme === t.id
                ? "border-primary bg-primary-soft text-primary shadow-xs"
                : "border-border bg-surface hover:bg-surface-elevated text-muted hover:text-foreground"
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

