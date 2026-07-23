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
  title: "Pausa Visual — Prevención de fatiga visual digital",
  description:
    "Aplicativo demo para la prevención de la fatiga visual digital en estudiantes universitarios.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={montserrat.variable}>
      <body className="min-h-screen bg-brand-bg font-sans text-black transition-colors duration-300 dark:bg-brand-dark dark:text-slate-100">
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
