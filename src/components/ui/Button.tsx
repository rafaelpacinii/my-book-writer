import React, { ButtonHTMLAttributes } from "react";

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
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>Carregando...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
