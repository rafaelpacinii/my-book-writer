import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
