import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../app/globals.css";
import Head from 'next/head';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Azərişıq Beyin Mərkəzi",
  description: "Energetika sektorunda peşəkar təhsil və təlim xidmətləri ilə gələcəyin mütəxəssislərini yetişdiririk.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/images/logo.png', type: 'image/png' }
    ],
    apple: { url: '/images/logo.png', type: 'image/png' }
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="az">
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/images/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
      </Head>
      <body className={inter.className}>{children}</body>
    </html>
  );
} 