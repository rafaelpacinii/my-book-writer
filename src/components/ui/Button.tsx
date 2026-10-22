import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { buttonStyles, type ButtonVariant } from "@/components/ui/buttonStyles";

export type { ButtonVariant } from "@/components/ui/buttonStyles";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingLabel?: string;
}

export function Button({ variant = "primary", isLoading = false, loadingLabel,
  disabled = false, className = "", children, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={`${buttonStyles(variant)} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none" />}
      {isLoading && loadingLabel ? loadingLabel : children}
    </button>
  );
}
