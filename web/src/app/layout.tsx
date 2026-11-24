import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sistema Experto Respiratorio | Representación del Conocimiento",
  description:
    "Sistema basado en reglas para detección de enfermedades respiratorias mediante encadenamiento hacia adelante, lógica proposicional, LPO y grafos de conocimiento.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#0b1120] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
