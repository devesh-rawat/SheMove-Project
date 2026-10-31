import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "SafeJourney · Live trip",
  description: "Live journey tracking shared with you",
  robots: { index: false, follow: false }, // private links must never be indexed
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#F5EFE6" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
