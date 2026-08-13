import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#171311", // Deep espresso
};

export const metadata: Metadata = {
  title: "Lumina Cafe Menu",
  description: "Premium Digital QR Menu for Lumina Cafe.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} antialiased`}>
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden selection:bg-accent/30 selection:text-foreground">
        {children}
      </body>
    </html>
  );
}
