import type { Metadata } from "next";
import { Nunito, Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui/error-toast";

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
  title: "Distribuia - Convierte videos en posts de LinkedIn",
  description:
    "Transforma tus videos de YouTube en posts de LinkedIn y X en espanol. Rapido, nativo, sin sonar a robot.",
  keywords: [
    "repurposing",
    "contenido",
    "creadores",
    "redes sociales",
    "linkedin",
    "twitter",
    "x",
    "youtube",
    "espanol",
  ],
  authors: [{ name: "Distribuia" }],
  creator: "Distribuia",
  publisher: "Distribuia",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://distribuia.com",
    siteName: "Distribuia",
    title: "Distribuia - Convierte videos en posts de LinkedIn",
    description:
      "Transforma tus videos de YouTube en posts de LinkedIn y X en espanol. Rapido, nativo, sin sonar a robot.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Distribuia - Repurposing de contenido para creadores",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Distribuia - Convierte videos en posts de LinkedIn",
    description:
      "Transforma tus videos de YouTube en posts de LinkedIn y X en espanol. Rapido, nativo, sin sonar a robot.",
    images: ["/og-image.png"],
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
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
      </body>
    </html>
  );
}
