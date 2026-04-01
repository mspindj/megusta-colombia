import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Me Gusta Colombia | 72-Hour Survival Intel for First-Time Travelers",
  description:
    "Not a tourist guide. Tactical local intelligence for your first 72 hours in Colombia. Bogotá, Medellín, Cartagena and more.",
  keywords: [
    "Colombia travel guide",
    "Bogota first time",
    "Medellin safety tips",
    "Cartagena survival guide",
    "Colombia travel tips",
    "digital nomad Colombia",
  ],
  openGraph: {
    title: "Me Gusta Colombia | 72-Hour Survival Intel",
    description:
      "Tactical local intelligence for your first 72 hours in Colombia.",
    url: "https://megusta.com.co",
    siteName: "Me Gusta Colombia",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
