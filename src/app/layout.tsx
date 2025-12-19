import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Looplet Builder - AI-Powered App Generator",
  description: "Transform your ideas into fully functional applications in minutes. Looplet Builder uses Claude AI to generate production-ready Next.js apps from natural language prompts.",
  keywords: ["AI", "app generator", "Next.js", "React", "Claude", "no-code", "low-code"],
  authors: [{ name: "Looplet AI Systems" }],
  openGraph: {
    title: "Looplet Builder - AI-Powered App Generator",
    description: "Transform your ideas into fully functional applications in minutes.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Looplet Builder - AI-Powered App Generator",
    description: "Transform your ideas into fully functional applications in minutes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
