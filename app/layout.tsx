import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tenex AI Strategist Workbench",
  description:
    "Candidate workbench for turning discovery into a decision snapshot, first AI pilot, build handoff, adoption path, and final brief.",
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
