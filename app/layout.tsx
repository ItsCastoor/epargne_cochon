import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "💰 Épargne Cochon",
  description: "Gestion de comptes partagés d'épargne",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ProtectedLayout>{children}</ProtectedLayout>
      </body>
    </html>
  );
}

