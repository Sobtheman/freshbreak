export function EyeMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 250 150" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="fb-iris" cx="42%" cy="38%" r="68%">
          <stop offset="0%" stopColor="#C9F5EF" />
          <stop offset="35%" stopColor="#4ED8C8" />
          <stop offset="72%" stopColor="#17A398" />
          <stop offset="100%" stopColor="#0B4F55" />
        </radialGradient>
      </defs>
      {/* ceja */}
      <path
        d="M30 46 Q112 -10 214 40 Q152 24 98 34 Q58 42 30 46 Z"
        fill="#0E2A47"
      />
      {/* pestañas */}
      <path d="M194 60 L222 42" stroke="#0E2A47" strokeWidth="7" strokeLinecap="round" />
      <path d="M204 72 L234 60" stroke="#0E2A47" strokeWidth="7" strokeLinecap="round" />
      <path d="M211 86 L242 80" stroke="#0E2A47" strokeWidth="6" strokeLinecap="round" />
      {/* globo ocular */}
      <path
        d="M34 92 Q120 28 208 92 Q120 146 34 92 Z"
        fill="#F4FBFA"
        stroke="#0E2A47"
        strokeWidth="5"
      />
      {/* párpado superior */}
      <path
        d="M32 90 Q120 22 210 90"
        fill="none"
        stroke="#0E2A47"
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* lagrimal */}
      <circle cx="48" cy="94" r="7" fill="#D9A7C7" opacity="0.7" />
      {/* iris */}
      <circle cx="126" cy="90" r="35" fill="url(#fb-iris)" />
      <circle cx="126" cy="90" r="14" fill="#082033" />
      <ellipse cx="113" cy="76" rx="10" ry="7" fill="#fff" opacity="0.95" />
      {/* párpado inferior */}
      <path
        d="M54 112 Q122 142 196 106"
        fill="none"
        stroke="#0E2A47"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}
