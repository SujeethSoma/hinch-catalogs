import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HINCH Catalogues",
  description: "Explore, preview, and download product catalogs from HINCH. Your trusted partner for quality materials and solutions.",
  themeColor: "#F46300",
  openGraph: {
    title: "HINCH Catalogues",
    description: "Explore, preview, and download product catalogs from HINCH. Your trusted partner for quality materials and solutions.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "HINCH Catalogues",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-[#414042]`}>
        <Header />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}