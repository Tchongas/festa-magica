import type { Metadata } from "next";
import { Fredoka, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Festa Mágica - Crie Convites Infantis com IA",
  description: "Plataforma para criar convites e kits de festa infantil personalizados usando inteligência artificial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${fredoka.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
