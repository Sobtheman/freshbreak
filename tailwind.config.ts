import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Mundo marino (tema por defecto)
        marine: {
          bg: "#06282A", // fondo de página oscuro
          deep: "#0A3F40", // superficies oscuras secundarias
          line: "#40BFC0", // teal luminoso: líneas, enlaces, glow
        },
        // Sistema brumoso (tema claro)
        mist: {
          bg: "#F7FBFB",
          tint: "#E6F2F2",
        },
        ink: "#0E3B3B", // texto sobre paneles claros
        // Alias históricos re-mapeados a la paleta nueva (mantienen
        // funcionando los componentes existentes sin reescribirlos todos)
        brand: {
          bg: "#F7FBFB",
          accent: "#0E3B3B",
          dark: "#06282A",
          card: "#0A3F40",
          teal: "#40BFC0",
          tealDark: "#0E7C74",
          tealDeep: "#0B4F55",
          orange: "#F79A56",
          orangeDark: "#E8823B",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "Montserrat", "sans-serif"],
      },
      boxShadow: {
        panel: "0 10px 40px rgba(3, 24, 25, 0.35), 0 0 0 1px rgba(64, 191, 192, 0.10)",
        panelLight: "0 10px 30px rgba(14, 59, 59, 0.08)",
        glowTeal: "0 0 24px rgba(64, 191, 192, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
