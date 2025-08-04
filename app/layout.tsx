import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIVRA",
  description: "Created to SIVRA",
  generator: "SIVRA",
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
