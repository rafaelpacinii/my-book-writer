import React from "react";

export function ContinueArtwork() {
  return (
    <div className="relative w-full md:w-72 lg:w-84 h-52 md:h-auto shrink-0 overflow-hidden bg-primary-soft/40">
      <svg
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="continue-art" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#CBD4BF" />
            <stop offset="1" stopColor="#E4D8BC" />
          </linearGradient>
        </defs>
        <rect width="600" height="400" fill="url(#continue-art)" />
        <g fill="none" stroke="#52664E" strokeWidth="1.3" opacity=".6">
          <circle cx="460" cy="140" r="150" />
          <circle cx="460" cy="140" r="124" />
          <circle cx="460" cy="140" r="98" />
          <path d="M0 305H600M0 323H600M0 341H600M96 0V400M114 0V400" />
        </g>
        <path
          d="M180 400V160a90 90 0 0 1 180 0v240Z"
          fill="#FAF9F6"
          opacity=".65"
        />
        <circle cx="270" cy="160" r="48" fill="#52664E" opacity=".6" />
        <path
          d="M220 400V250l105-66V400Z"
          fill="#52664E"
          opacity=".88"
        />
      </svg>
    </div>
  );
}
