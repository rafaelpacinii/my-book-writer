import React from "react";

export function AuthArtwork() {
  return (
    <div className="flex flex-col w-full max-w-[592px]">
      <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[480px] rounded-[24px] overflow-hidden shadow-xs border border-border/40">
        <svg
          viewBox="0 0 600 400"
          className="w-full h-full object-cover"
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

      <div className="mt-8">
        <span className="text-[12px] font-bold text-primary tracking-wider uppercase">
          UM ESPAÇO PARA SUAS IDEIAS
        </span>
        <h1 className="font-serif text-[30px] sm:text-[34px] text-foreground font-normal leading-[1.3] mt-2.5">
          Cada linha abre <br /> um novo caminho.
        </h1>
        <p className="text-muted text-[15px] sm:text-[16px] mt-3.5 leading-relaxed">
          Organize seus livros. Encontre sua voz. <br />
          Continue de onde a história parou.
        </p>
      </div>
    </div>
  );
}
