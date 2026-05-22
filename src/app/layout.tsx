import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
    "Tourists get scammed, overpay, and waste their first 3 days. You won't. Tactical local intelligence for Bogotá, Medellín & Cartagena — $17 per city.",
  keywords: [
    "Colombia travel guide",
    "Bogota first time",
    "Medellin safety tips",
    "Cartagena survival guide",
    "Colombia travel tips",
    "digital nomad Colombia",
    "Colombia first trip",
    "Colombia scam prevention",
  ],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📍</text></svg>",
  },
  openGraph: {
    title: "Me Gusta Colombia | 72-Hour Survival Intel",
    description:
      "Tourists get scammed, overpay, and waste their first 3 days. You won't. Tactical local intelligence for your first 72 hours in Colombia.",
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
      <body className="min-h-full flex flex-col">
        {children}
        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','1525809615712600');
            fbq('track','PageView');
          `}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1525809615712600&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
