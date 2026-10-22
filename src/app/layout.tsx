import type { Metadata } from "next";
import "./globals.css";
import { preferenceBootstrap } from "@/lib/preferences/bootstrap";
import { PreferenceProvider } from "@/components/shared/PreferenceProvider";
import { AppDataProvider } from "@/components/shared/AppDataProvider";

export const metadata: Metadata = {
  title: "My Book Writer",
  description: "Estúdio editorial para escritores",
};

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
