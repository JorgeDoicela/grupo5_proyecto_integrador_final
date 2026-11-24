import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NeumoLógica+ | Sistema Experto de Enfermedades Respiratorias",
  description:
    "Sistema basado en reglas para detección de enfermedades respiratorias mediante encadenamiento hacia adelante, lógica proposicional, LPO y grafos de conocimiento.",
  icons: {
    icon: [
      { url: "/ube-logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/ube-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#f0f4f9] text-[#1f1f1f] antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
