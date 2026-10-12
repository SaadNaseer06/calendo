import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { Ga4Script } from "@/components/analytics/ga4-script";
import { getSiteBaseUrl } from "@/lib/site-routes";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const siteUrl = getSiteBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Calendo — Social Media Marketing Manager",
    template: "%s | Calendo",
  },
  description:
    "AI-powered social media marketing platform. Plan content on a calendar, generate posts with AI, track website traffic, and audit SEO.",
  keywords: [
    "social media management",
    "content calendar",
    "SMM",
    "AI marketing",
    "SEO audit",
    "website analytics",
  ],
  authors: [{ name: "Calendo" }],
  creator: "Calendo",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Calendo",
    title: "Calendo — Social Media Marketing Manager",
    description:
      "Plan, generate, and schedule social content with AI. Track website traffic and SEO in one workspace.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calendo — Social Media Marketing Manager",
    description: "AI-powered content calendar for social media teams.",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark font-sans", syne.variable, dmSans.variable)}>
      <body className={dmSans.className}>
        <Ga4Script />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
