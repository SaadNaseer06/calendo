import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Calendo — AI-powered social media content calendar and marketing workspace.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Sign in to Calendo",
    description: "Plan, generate, and schedule social content in one place.",
    type: "website",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
