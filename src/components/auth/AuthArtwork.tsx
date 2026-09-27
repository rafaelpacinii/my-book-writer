import React from "react";

export function AuthArtwork() {
  return (
    <div className="flex flex-col w-full max-w-148">
      <div className="relative w-full h-80 sm:h-100 lg:h-120 rounded-3xl overflow-hidden shadow-xs border border-border/40 bg-gradient-to-br from-[#CBD4BF] to-[#E4D8BC]">
        <svg
          viewBox="0 0 600 400"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="auth-grad" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#CBD4BF" />
              <stop offset="1" stopColor="#E4D8BC" />
            </linearGradient>
          </defs>
          <rect width="600" height="400" fill="url(#auth-grad)" />
          <g fill="none" stroke="var(--primary)" strokeWidth="1.3" opacity="0.6">
            <circle cx="460" cy="140" r="150" />
            <circle cx="460" cy="140" r="124" />
            <circle cx="460" cy="140" r="98" />
            <path d="M0 305H600M0 323H600M0 341H600M96 0V400M114 0V400" />
          </g>
          <path d="M180 400V160a90 90 0 0 1 180 0v240Z" fill="var(--surface)" opacity="0.75" />
          <circle cx="270" cy="160" r="48" fill="var(--primary)" opacity="0.6" />
          <path d="M220 400V250l105-66V400Z" fill="var(--primary)" opacity="0.88" />
        </svg>
      </div>
    </div>
  );
}
