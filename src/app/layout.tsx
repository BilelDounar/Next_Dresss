import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { LayoutProvider } from '@/context/LayoutContext';
import { AuthProvider } from '@/context/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dresss",
    template: "%s | Dresss - Mode et Inspiration",
  },
  description: "Dresss est votre référence en matière de mode, d'inspiration et de partage de tenues tendance.",
  applicationName: "Dresss",
  authors: [{ name: "Bilel Dounar" }],
  creator: "Bilel Dounar",
  metadataBase: new URL("https://dresss.cloud"),
  keywords: ["mode", "tendances", "look", "outfit", "Dresss", "tenue", "partage", "fashion", "streetwear"],
  openGraph: {
    title: "Dresss",
    description: "Découvrez, partagez et enregistrez les tenues tendances avec Dresss.",
    url: "https://dresss.cloud",
    siteName: "Dresss",
    images: [
      {
        url: "/icons/icon-512x512.png", // à créer dans /public
        width: 1200,
        height: 630,
        alt: "Aperçu Dresss",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dresss",
    description: "Application web dédiée à la mode et au partage de tenues stylées.",
    creator: "@dresssapp",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"
        />
        {/* Next.js expose automatiquement `src/app/manifest.ts` à l'URL /manifest.webmanifest */}
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-fit bg-primary-300`}
      >
        <main className="h-full overflow-y-hidden max-w-[450px] mx-auto">
          <AuthProvider>
            <LayoutProvider>
              {children}
              <AppShell />
            </LayoutProvider>
          </AuthProvider>
        </main>
      </body>
    </html>
  );
}
