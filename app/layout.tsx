import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "YapaSegura",
  description: "Plataforma de rescate de excedentes alimentarios en Ecuador",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${fontSans.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
