// Iconos de línea propios (sustituyen a los emojis) en el estilo del logo:
// trazo azul marino con acento teal.

type IconProps = { className?: string };
const base = "h-7 w-7";

function Stroke({ children, className }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? base}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconEncuesta(p: IconProps) {
  return (
    <Stroke {...p}>
      <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
      <path d="M9 3.5 V6 H15 V3.5" />
      <path d="M9 11 h6 M9 14.5 h6" />
      <path d="M8.6 10.9 l0 0" />
      <circle cx="9" cy="18" r="0.2" />
    </Stroke>
  );
}

export function IconCalendario(p: IconProps) {
  return (
    <Stroke {...p}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 9.5 H20.5 M8 3 v3.5 M16 3 v3.5" />
      <path d="M7.5 13.5 h3 M13.5 13.5 h3 M7.5 17 h3" />
    </Stroke>
  );
}

export function IconCampana(p: IconProps) {
  return (
    <Stroke {...p}>
      <path d="M12 4 a6 6 0 0 1 6 6 v3.2 l1.6 2.6 a0.8 0.8 0 0 1 -0.7 1.2 H5.1 a0.8 0.8 0 0 1 -0.7 -1.2 L6 13.2 V10 a6 6 0 0 1 6 -6 Z" />
      <path d="M10 19.5 a2 2 0 0 0 4 0" />
    </Stroke>
  );
}

export function IconCorreo(p: IconProps) {
  return (
    <Stroke {...p}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M4.5 7.5 L12 13 L19.5 7.5" />
    </Stroke>
  );
}

export function IconOjo(p: IconProps) {
  return (
    <Stroke {...p}>
      <path d="M3 12 C6 7.5 9.5 5.5 12 5.5 C15.5 5.5 19 8 21 12 C19 16 15.5 18.5 12 18.5 C8.5 18.5 5 16 3 12 Z" />
      <circle cx="12" cy="12" r="3.2" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </Stroke>
  );
}

export function IconGrafico(p: IconProps) {
  return (
    <Stroke {...p}>
      <path d="M4 4 V20 H20" />
      <path d="M8 16 V11 M12 16 V8 M16 16 V13" />
      <path d="M7 7.5 L11 5.5 L15 7 L19 4.5" />
    </Stroke>
  );
}

export function IconReloj(p: IconProps) {
  return (
    <Stroke {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7 V12 L15.5 14" />
    </Stroke>
  );
}

export function IconPerfil(p: IconProps) {
  return (
    <Stroke {...p}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20 C6 15.5 9 14 12 14 C15 14 18 15.5 19 20" />
    </Stroke>
  );
}
