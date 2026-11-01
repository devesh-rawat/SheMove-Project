import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SheMove | Guardian & Police Command Operations",
  description: "Real-time safety tracking and police emergency operations center for SheMove",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

