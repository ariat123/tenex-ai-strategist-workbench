import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tenex AI Strategist Workbench",
  description:
    "Candidate prototype for turning discovery notes into opportunity ranking, a first AI pilot, rollout plan, build handoff, and strategist brief.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
