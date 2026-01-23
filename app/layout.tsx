import type { Metadata } from "next";
import { Nunito, Inter } from "next/font/google";
import "./globals.css";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://distribuia.com"),
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://distribuia.com",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${nunito.variable} ${inter.variable} font-body antialiased bg-background text-navy`}
      >
        {children}
        <ToastContainer />
        <CookieConsent />
      </body>
    </html>
  );
}
