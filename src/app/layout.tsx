import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistem Pembayaran - Pondok Pesantren Inayatullah",
  description: "Sistem Pembayaran Santri Pondok Pesantren Inayatullah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}
