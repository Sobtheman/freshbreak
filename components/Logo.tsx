// Recreación vectorial fiel del logo FreshBreak (insignia con degradado
// turquesa, ojo realista con pestañas, textura de líneas de escaneo y línea
// punteada a través del iris). Sustituir por el archivo vectorizado original
// en cuanto esté disponible.

export function EyeBadge({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 300" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="fbBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDFEFE" />
          <stop offset="45%" stopColor="#C8EEEA" />
          <stop offset="100%" stopColor="#35C8BC" />
        </linearGradient>
        <radialGradient id="fbIris" cx="45%" cy="40%" r="62%">
          <stop offset="0%" stopColor="#DFF9F5" />
          <stop offset="30%" stopColor="#59DBCD" />
          <stop offset="62%" stopColor="#1BA99C" />
          <stop offset="88%" stopColor="#0F6E70" />
          <stop offset="100%" stopColor="#0A3F4E" />
        </radialGradient>
        <clipPath id="fbBadge">
          <rect x="0" y="0" width="300" height="300" rx="36" />
        </clipPath>
      </defs>

      <g clipPath="url(#fbBadge)">
        <rect width="300" height="300" fill="url(#fbBg)" />

        {/* textura de escaneo */}
        <g stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1.4">
          <path d="M18 60 H86 M104 60 H128" />
          <path d="M212 44 H268 M186 44 H202" />
          <path d="M24 236 H72 M84 236 H140" />
          <path d="M206 250 H236 M248 250 H282" />
          <path d="M258 120 H292" />
          <path d="M10 130 H34" />
        </g>
        <g stroke="#0E2A47" strokeOpacity="0.12" strokeWidth="1.4">
          <path d="M40 30 L74 12 M232 286 L266 268 M282 200 L298 190" />
        </g>

        {/* línea punteada a través del iris */}
        <path
          d="M4 158 H296"
          stroke="#35D3C5"
          strokeWidth="7"
          strokeDasharray="26 12"
          opacity="0.85"
        />

        {/* ceja */}
        <path
          d="M52 92 C96 46 176 40 240 78 C244 80 242 86 237 84 C178 62 108 70 60 100 C54 104 48 97 52 92 Z"
          fill="#122B45"
        />

        {/* pestañas superiores */}
        <g fill="#122B45">
          <path d="M226 96 C242 84 256 76 272 72 C258 84 246 94 234 104 Z" />
          <path d="M238 116 C256 108 270 104 286 102 C272 112 258 120 246 128 Z" />
          <path d="M244 140 C262 136 276 136 290 138 C276 146 262 150 250 152 Z" />
          <path d="M204 82 C214 68 224 58 238 50 C230 64 222 78 214 90 Z" />
        </g>

        {/* globo ocular */}
        <path
          d="M44 158 C82 108 132 88 158 88 C196 88 234 116 254 158 C234 196 196 220 156 220 C114 220 74 196 44 158 Z"
          fill="#F6FCFB"
          stroke="#122B45"
          strokeWidth="6"
        />
        {/* párpado superior grueso */}
        <path
          d="M44 158 C82 106 134 86 160 86 C198 86 236 116 255 156"
          fill="none"
          stroke="#122B45"
          strokeWidth="11"
          strokeLinecap="round"
        />
        {/* lagrimal */}
        <path d="M46 156 C52 148 60 146 66 150 C60 158 54 162 48 162 Z" fill="#D8A0BC" />

        {/* iris con textura radial */}
        <circle cx="156" cy="156" r="44" fill="url(#fbIris)" />
        <g stroke="#0B5B5E" strokeOpacity="0.5" strokeWidth="1.6">
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const x1 = 156 + Math.cos(a) * 18;
            const y1 = 156 + Math.sin(a) * 18;
            const x2 = 156 + Math.cos(a) * 41;
            const y2 = 156 + Math.sin(a) * 41;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </g>
        <circle cx="156" cy="156" r="44" fill="none" stroke="#0A3F4E" strokeWidth="3" />
        <circle cx="156" cy="156" r="17" fill="#071A2B" />
        <ellipse cx="143" cy="140" rx="11" ry="8" fill="#FFFFFF" opacity="0.95" />
        <circle cx="170" cy="172" r="4.5" fill="#FFFFFF" opacity="0.6" />

        {/* párpado y pestañas inferiores */}
        <path
          d="M66 186 C104 214 180 222 238 184"
          fill="none"
          stroke="#122B45"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.9"
        />
        <g stroke="#122B45" strokeWidth="4" strokeLinecap="round" opacity="0.85">
          <path d="M210 208 L220 222" />
          <path d="M228 198 L240 210" />
        </g>
      </g>
    </svg>
  );
}

export function LogoLockup({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <EyeBadge className="w-40 rounded-[36px] shadow-xl shadow-brand-tealDeep/25 sm:w-48" />
      <p className="mt-5 text-4xl font-bold tracking-[0.08em] text-[#0E2A47] dark:text-slate-100 sm:text-5xl">
        FRESHBREAK
      </p>
      <p className="mt-1 text-sm font-bold uppercase tracking-[0.3em] text-brand-tealDark dark:text-brand-teal sm:text-base">
        Hora de tu pausa visual
      </p>
    </div>
  );
}
