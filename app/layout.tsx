import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cashfree KYC — Integration POC",
  description: "Interactive proof-of-concept for Cashfree Secure ID APIs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
