import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

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

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: "PostWave — Open-source bulk X scheduler",
  description:
    "Schedule X posts in bulk via the official API. CLI, desktop app, or deploy daemon — your keys, your machine.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "PostWave — Open-source bulk X scheduler",
    description:
      "CLI, desktop, or self-hosted daemon. Local-first scheduling for X.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} min-h-screen bg-zinc-950 font-sans text-zinc-50 antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
