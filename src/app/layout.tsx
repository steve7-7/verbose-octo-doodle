import type { Metadata } from "next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GoalEdge — Smarter Football Predictions",
    template: "%s | GoalEdge",
  },
  description:
    "Expert football predictions, real odds and in-depth analysis. Start free, upgrade to premium. 10+ leagues, data-driven tips, real-time value alerts.",
  keywords: [
    "football predictions",
    "soccer tips",
    "betting tips",
    "Premier League",
    "NPFL",
    "GoalEdge",
    "football analysis",
    "value bets",
  ],
  authors: [{ name: "GoalEdge" }],
  creator: "GoalEdge",
  publisher: "GoalEdge",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "GoalEdge — Smarter Football Predictions",
    description: "Predict smarter. Win more often. Expert tips across 10+ leagues.",
    siteName: "GoalEdge",
    url: siteUrl,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoalEdge — Smarter Football Predictions",
    description: "Predict smarter. Win more often.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
