import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/toaster";
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
    default: "LORENO - Fiches de Révision & Tuteur IA d'Examen en 3s",
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
  icons: {
    icon: "/icon",
    shortcut: "/icon",
    apple: "/apple-icon",
  },
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
    title: "LORENO - Fiches de Révision & Tuteur IA d'Examen en 3s",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://www.loreno.app/#webapp",
      "name": "Loreno",
      "url": "https://www.loreno.app",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "All",
      "description":
        "Transforme tes notes et photos de cours en fiches de révision interactives et tuteur IA d'examen en 3 secondes.",
      "offers": {
        "@type": "Offer",
        "price": "9.99",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://www.loreno.app/#organization",
      "name": "Loreno",
      "url": "https://www.loreno.app",
      "logo": "https://www.loreno.app/icon.png",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var p = new URLSearchParams(window.location.search);
                if (p.get('jury') === 'true' || p.get('jury') === '1' || p.get('demo') === 'pro' || p.get('pass') === 'jury') {
                  localStorage.setItem('loreno_pro', 'true');
                  localStorage.setItem('loreno_jury_mode', 'true');
                  document.cookie = 'loreno_pro=true; path=/; max-age=31536000; SameSite=Lax';
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${geistSans.className} antialiased min-h-full bg-white text-black`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
