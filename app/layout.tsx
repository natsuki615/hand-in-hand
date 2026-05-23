import type { Metadata } from "next";
import { Geist, Geist_Mono, Galindo, Cantarell } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const galindo = Galindo({
  variable: "--font-galindo",
  subsets: ["latin"],
  weight: "400",
});

const cantarell = Cantarell({
  variable: "--font-cantarell",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Hand in Hand",
  description: "Find faculty, labs, and student organizations at CMU that match your interests.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${galindo.variable} ${cantarell.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-cantarell)]">{children}</body>
    </html>
  );
}
