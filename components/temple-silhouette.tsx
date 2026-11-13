/** Decorative Harmandir Sahib-inspired scene. Purely illustrative, drawn in SVG. */
export function TempleSilhouette() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-x-0 bottom-0 h-full w-full"
    >
      <defs>
        <linearGradient id="gold-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0d58a" />
          <stop offset="100%" stopColor="#b88a2e" />
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b2540" />
          <stop offset="100%" stopColor="#0a0f1e" />
        </linearGradient>
      </defs>
      <rect y="270" width="800" height="130" fill="url(#water)" />
      <rect x="320" y="200" width="160" height="70" fill="url(#gold-fill)" opacity="0.9" />
      <rect x="310" y="192" width="180" height="10" fill="#d4a94c" />
      <path d="M345 192c0-40 25-62 55-62s55 22 55 62Z" fill="url(#gold-fill)" />
      <rect x="397" y="108" width="6" height="26" fill="#d4a94c" />
      <circle cx="400" cy="104" r="5" fill="#f0d58a" />
      {[335, 365, 435, 465].map((x) => (
        <g key={x}>
          <rect x={x - 8} y="170" width="16" height="22" fill="#d4a94c" />
          <path d={`M${x - 10} 170c0-12 6-18 10-18s10 6 10 18Z`} fill="url(#gold-fill)" />
        </g>
      ))}
      <rect x="392" y="270" width="16" height="130" fill="#1b2540" opacity="0.6" />
      <g opacity="0.22" transform="translate(0 540) scale(1 -1)">
        <path d="M345 192c0-40 25-62 55-62s55 22 55 62Z" fill="#d4a94c" />
        <rect x="320" y="200" width="160" height="70" fill="#d4a94c" />
      </g>
    </svg>
  );
}
