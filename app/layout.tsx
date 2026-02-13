import type { Metadata } from "next";
import { Nunito, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { ToastContainer } from "@/components/ui/error-toast";
import { CookieConsent } from "@/components/cookie-consent";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Distribuia - Convierte videos en posts",
  description:
    "Transforma tus videos de YouTube en posts de LinkedIn y X en español. Rápido, nativo, sin sonar a robot.",
  keywords: [
    "repurposing",
    "contenido",
    "creadores",
    "redes sociales",
    "linkedin",
    "twitter",
    "x",
    "youtube",
    "español",
  ],
  authors: [{ name: "Distribuia" }],
  creator: "Distribuia",
  publisher: "Distribuia",
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://distribuia.es"),
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://distribuia.es",
    siteName: "Distribuia",
    title: "Distribuia - Convierte videos en posts de LinkedIn",
    description: "De YouTube a LinkedIn en 2 minutos. Español nativo.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Distribuia",
    description: "De YouTube a LinkedIn en 2 minutos.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Distribuia",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://distribuia.es",
  description:
    "Transforma tus videos de YouTube, artículos y textos en posts de LinkedIn y X en español nativo.",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      name: "Free",
      description: "2 conversiones al mes",
    },
    {
      "@type": "Offer",
      price: "19",
      priceCurrency: "EUR",
      name: "Starter",
      description: "10 conversiones al mes",
    },
    {
      "@type": "Offer",
      price: "49",
      priceCurrency: "EUR",
      name: "Pro",
      description: "30 conversiones al mes",
    },
  ],
  provider: {
    "@type": "Organization",
    name: "Paragonum S.L.U.",
    url: "https://distribuia.es",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Carrer de Sant Vicent Màrtir 85, 8º dcha",
      addressLocality: "Valencia",
      postalCode: "46007",
      addressCountry: "ES",
    },
  },
  inLanguage: "es",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${nunito.variable} ${inter.variable} font-body antialiased bg-background text-navy`}
      >
        {children}
        <Analytics />
        <ToastContainer />
        <CookieConsent />
      </body>
    </html>
  );
}
