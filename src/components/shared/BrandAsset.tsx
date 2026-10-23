import Image from "next/image";

type BrandVariant = "horizontal" | "stacked" | "symbol" | "micro";

interface Props {
  variant?: BrandVariant;
  className?: string;
}

const variants = {
  horizontal: { file: "logo-horizontal", light: "color", dark: "dark", width: 905, height: 220 },
  stacked: { file: "logo-stacked", light: "color", dark: "dark", width: 484, height: 336 },
  symbol: { file: "symbol", light: "green", dark: "sage", width: 256, height: 256 },
  micro: { file: "micro", light: "green", dark: "sage", width: 256, height: 256 },
} as const;

export function BrandAsset({ variant = "symbol", className = "" }: Props) {
  const asset = variants[variant];
  return (
    <span role="img" aria-label="My Book Writer" data-brand={variant}
      className={`brand-asset brand-${variant} ${className}`}
    >
      <Image src={`/brand/${asset.file}-${asset.light}.svg`} width={asset.width} height={asset.height}
        alt="" aria-hidden="true" className="brand-light" loading="eager" />
      <Image src={`/brand/${asset.file}-${asset.dark}.svg`} width={asset.width} height={asset.height}
        alt="" aria-hidden="true" className="brand-dark" loading="eager" />
    </span>
  );
}
