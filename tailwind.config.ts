import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#E6F0FA",
          accent: "#003366",
          dark: "#0B1B2E",
          card: "#122740",
          teal: "#2EC4B6",
          tealDark: "#0E7C74",
          tealDeep: "#0B4F55",
          orange: "#F79A56",
          orangeDark: "#E8823B",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
