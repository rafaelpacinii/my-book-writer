interface Props {
  variant: number;
}

const artwork = [
  <g key="arches">
    <path d="M15 145V53a45 45 0 0 1 90 0v92" fill="currentColor" opacity=".18" />
    <path d="M22 145V60a38 38 0 0 1 76 0v85M30 145V65a30 30 0 0 1 60 0v80M38 145V71a22 22 0 0 1 44 0v74" />
    <circle cx="60" cy="52" r="16" fill="currentColor" opacity=".85" />
  </g>,
  <g key="orbits">
    <circle cx="90" cy="75" r="60" /><circle cx="90" cy="75" r="48" /><circle cx="90" cy="75" r="36" />
    <path d="M0 125 120 5M0 145 120 25M20 145 120 45" />
  </g>,
  <g key="waves">
    <path d="M0 70Q30 30 60 70t60 0M0 82Q30 42 60 82t60 0M0 94Q30 54 60 94t60 0M0 106Q30 66 60 106t60 0M0 118Q30 78 60 118t60 0" />
    <circle cx="80" cy="30" r="19" fill="currentColor" opacity=".6" />
  </g>,
  <g key="doorway">
    <path d="M10 140V55a45 45 0 0 1 90 0v85M25 140V65a30 30 0 0 1 60 0v75M40 140V75a15 15 0 0 1 30 0v65M0 120h120M0 130h120" />
  </g>,
  <g key="lines">
    <circle cx="65" cy="60" r="43" /><circle cx="65" cy="60" r="33" /><circle cx="65" cy="60" r="23" />
    <path d="M65 17v126M35 140V20M95 140V20" />
  </g>,
  <g key="crossing">
    <path d="M0 60h120M0 72h120M0 84h120M25 0v145M37 0v145" />
    <circle cx="70" cy="90" r="38" fill="currentColor" opacity=".23" /><circle cx="70" cy="90" r="27" />
  </g>,
];

export function BookCoverArt({ variant }: Props) {
  return (
    <svg className="book-cover-art" viewBox="0 0 120 145" fill="none"
      stroke="currentColor" strokeWidth=".65" aria-hidden="true"
    >
      {artwork[variant]}
    </svg>
  );
}
