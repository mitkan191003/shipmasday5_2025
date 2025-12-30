import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Touch Grass Simulator",
  description: "An app for people who refuse to go outside.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
