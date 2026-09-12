import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.loreno.app"),
  title: {
    default: "Loreno ⚡ — Fiches de Révision & Tuteur IA d'Examen en 3s",
    template: "%s | Loreno",
  },
  description:
    "Prends en photo tes notes de cours (même illisibles) : obtiens tes fiches de révision interactives 3D et un tuteur IA d'examen en 3 secondes.",
  keywords: [
    "fiches de révision",
    "flashcards",
    "tuteur IA",
    "révision examen",
    "révision partiels",
    "scan de cours",
    "mémorisation active",
    "PASS médecine",
    "droit",
    "Loreno",
  ],
  authors: [{ name: "Loreno" }],
  creator: "Loreno",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.loreno.app",
    siteName: "Loreno",
    title: "Loreno ⚡ — Révise 2x plus vite avec ton tuteur IA",
    description:
      "Prends en photo n'importe quel cours. Obtiens tes fiches mémo interactives et ton entraînement d'examen en 3 secondes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Loreno ⚡ — Fiches de Révision & Tuteur IA d'Examen en 3s",
    description:
      "Prends en photo n'importe quel cours. Obtiens tes fiches mémo interactives et ton entraînement d'examen en 3 secondes.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className="h-full">
      <body className={`${geistSans.className} antialiased min-h-full bg-white text-black`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
