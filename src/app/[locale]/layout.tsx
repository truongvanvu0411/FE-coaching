import type { Metadata, Viewport } from "next";
import { Geist_Mono, Montserrat, Noto_Sans_JP } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "@/i18n/routing";
import "../globals.css";

// Inter has full, properly-shaped Vietnamese glyph coverage (verified subset).
// Zen Kaku Gothic New (loaded below) only covers Japanese + bare Latin — with
// no Vietnamese tone-mark shaping, so it must never be the primary font for
// Vietnamese text or diacritics render detached from their base letter.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

// The comment above used to promise Zen Kaku Gothic New was "loaded below". It
// never was — there was no stylesheet link, and --font-sans fell through to
// whatever Japanese face the operating system happened to have: Hiragino on
// macOS, Yu Gothic on Windows, frequently nothing on Linux or Android. Every
// question body in this app is Japanese, so it was the largest unowned piece of
// the design.
const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FE Coach",
  description: "高品質・検証済みの基本情報技術者試験(FE)問題で学ぶ",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${montserrat.variable} ${notoSansJP.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* next/font/google can't self-host this family with japanese+vietnamese glyph coverage
            (its bundled subset list only offers latin/latin-ext/cyrillic for it), so it's loaded
            via a real Google Fonts stylesheet instead, letting the browser fetch the right subset. */}
      </head>
      {/* Browser extensions (translators, form-fillers, etc.) commonly inject attributes
          into <body> before React hydrates — that's a false-positive mismatch, not a bug
          in our markup. suppressHydrationWarning only silences the warning for this node;
          it does not disable hydration or affect any other element. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <NextIntlClientProvider>
          <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
              <Toaster />
            </ThemeProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
