import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonStyles, type ButtonVariant } from "@/components/ui/buttonStyles";

export function LinkButton({ variant, className = "", ...props }: ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return <Link className={`${buttonStyles(variant)} ${className}`} {...props} />;
}
