import React from "react";

interface Props {
  index?: number;
  className?: string;
}

const PALETTES = [
  ["#CBD4BF", "#E4D8BC"],
  ["#D8B8A6", "#E4D8BC"],
  ["#BBCBD1", "#CBD4BF"],
  ["#E4D8BC", "#D8B8A6"],
];

export function BookCoverArtwork({ index = 0, className }: Props) {
  const p = Math.abs(index) % 4;
  const [c0, c1] = PALETTES[p];
  const gradId = `art-grad-${p}`;

  return (
    <div className={className || "w-full h-44 rounded-t-xl overflow-hidden relative border-b border-border/50 select-none"}>
      <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" className="w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor={c0} />
            <stop offset="1" stopColor={c1} />
          </linearGradient>
        </defs>
        <rect width="600" height="400" fill={`url(#${gradId})`} />
        <g fill="none" stroke="var(--primary)" strokeWidth="1.3" opacity="0.6">
          {p === 0 && (
            <>
              <circle cx="460" cy="140" r="150" /><circle cx="460" cy="140" r="124" />
              <path d="M0 305H600M0 323H600M0 341H600M96 0V400M114 0V400" />
            </>
          )}
          {p === 1 && (
            <>
              <path d="M0 350 350 0M0 382 382 0M20 400 420 0M60 400 460 0" />
              <circle cx="420" cy="245" r="126" /><circle cx="420" cy="245" r="100" />
            </>
          )}
          {p === 2 && (
            <>
              <path d="M0 250Q150 100 300 250T600 250M0 275Q150 125 300 275T600 275" />
              <circle cx="430" cy="70" r="108" />
            </>
          )}
          {p === 3 && (
            <>
              <path d="M0 290H600M0 310H600M0 330H600M380 0V400M400 0V400" />
              <circle cx="200" cy="180" r="145" />
            </>
          )}
        </g>
        <path d="M180 400V160a90 90 0 0 1 180 0v240Z" fill="var(--surface)" opacity="0.75" />
        <circle cx="270" cy="160" r="48" fill="var(--primary)" opacity="0.6" />
        <path d="M220 400V250l105-66V400Z" fill="var(--primary)" opacity="0.88" />
      </svg>
    </div>
  );
}
