import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PilotPath",
  description:
    "Discovery-to-pilot strategy workbench for turning messy notes into a decision snapshot, first pilot, build handoff, adoption path, and final brief.",
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
