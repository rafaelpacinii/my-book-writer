export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary: "bg-surface text-foreground border border-control-border hover:bg-primary-soft/40",
  outline: "bg-transparent text-foreground border border-control-border hover:bg-primary-soft/30",
  ghost: "bg-transparent text-foreground hover:bg-primary-soft/30",
  danger: "bg-danger text-danger-foreground hover:bg-danger/90",
};

export function buttonStyles(variant: ButtonVariant = "primary") {
  return "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 "
    + "text-sm font-semibold transition-colors duration-150 cursor-pointer "
    + "disabled:opacity-60 disabled:cursor-not-allowed "
    + "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 "
    + variants[variant];
}
