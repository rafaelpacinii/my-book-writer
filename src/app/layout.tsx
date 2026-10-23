import type { Metadata, Viewport } from "next";
import "@/lib/branding/tokens.css";
import "./globals.css";
import "@/components/shared/branding.css";
import { preferenceBootstrap } from "@/lib/preferences/bootstrap";
import { PreferenceProvider } from "@/components/shared/PreferenceProvider";
import { AppDataProvider } from "@/components/shared/AppDataProvider";

export const metadata: Metadata = {
  title: "My Book Writer",
  description: "Estúdio editorial para escritores",
  applicationName: "My Book Writer",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = { themeColor: "#4B5E47" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/inter/Inter-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/eb-garamond/EBGaramond-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: preferenceBootstrap }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <PreferenceProvider>
          <AppDataProvider>{children}</AppDataProvider>
        </PreferenceProvider>
      </body>
    </html>
  );
}
