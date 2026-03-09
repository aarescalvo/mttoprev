import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "@/components/mtoprev/main-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MTOPREV - Sistema de Gestión de Mantenimiento Preventivo",
  description: "Sistema integral de gestión de mantenimiento para plantas industriales. Control de stock, herramientas, personal y solicitudes de mantenimiento.",
  keywords: ["Mantenimiento", "Preventivo", "Gestión", "Industrial", "Stock", "Herramientas"],
  authors: [{ name: "MTOPREV Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <MainLayout>
          {children}
        </MainLayout>
        <Toaster />
      </body>
    </html>
  );
}
