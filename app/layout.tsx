import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Silky's Deals and Steals",
  description: "Live clearance deals, pulled the moment they drop.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
