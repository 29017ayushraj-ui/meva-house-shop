import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ variable: "--font-body", subsets: ["latin"] });

const playfair = Playfair_Display({ variable: "--font-display", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Meva House | Premium Dry Fruits",
  description: "Fresh, handpicked dry fruits delivered to your door.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
      return <html lang="en" className={`${dmSans.variable} ${playfair.variable} h-full antialiased`}><body className="min-h-full">{children}</body></html>;
}
