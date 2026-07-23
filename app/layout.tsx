import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/providers";
import Header from "@/components/Header";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "FreshBreak — Hora de tu pausa visual",
  description:
    "Aplicativo demo para la prevención de la fatiga visual digital en estudiantes universitarios.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={montserrat.variable}>
      <body className="min-h-screen bg-mist-bg font-sans text-ink transition-colors duration-300 dark:bg-marine-bg dark:text-mist-tint">
        <AppProvider>
          <Header />
          <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-8">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
