import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tenex AI Strategist Workbench",
  description:
    "Candidate prototype for turning discovery notes into a first AI pilot, FDE handoff, adoption plan, and measurement brief.",
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
