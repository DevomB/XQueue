import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/providers";
import "./globals.css";

// Body face — neutral, modern, highly legible. Free via Google Fonts (OFL).
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

// Data / monospace face for timestamps, the bulk-paste format, and code-like UI.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Display face for headlines and the wordmark — engineered, precise, a touch
// more character than Geist so the brand has a recognizable voice up top.
// Free via Google Fonts (OFL).
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
    "Queue and schedule X posts in bulk via the official API. Self-host with Docker or deploy to your cloud.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "PostWave — Open-source bulk X scheduler",
    description:
      "Queue and schedule X posts in bulk. Self-host on Docker or AWS.",
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
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
