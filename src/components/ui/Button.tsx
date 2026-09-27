import React, { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary: "bg-surface text-foreground border border-control-border hover:bg-primary-soft/40",
  outline: "bg-transparent text-foreground border border-control-border hover:bg-primary-soft/30",
  ghost: "bg-transparent text-foreground hover:bg-primary-soft/30",
  danger: "bg-danger text-white hover:bg-danger/90",
};

export function Button({
  variant = "primary",
  isLoading = false,
  disabled = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center h-11 px-4 text-sm font-semibold rounded-lg " +
    "transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed " +
    "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";

  return (
    <button
      disabled={disabled || isLoading}
      className={`${base} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Carregando...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
