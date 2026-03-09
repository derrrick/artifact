import type { Metadata } from "next";
import { Unbounded, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalGrain from "@/components/GlobalGrain";

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ARTIFACT 探求者 — The Web's Finest Inspiration",
  description: "Handpicked destinations for anyone who believes the web can still feel like something.",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${unbounded.variable} ${geistMono.variable}`}>
      <body className="font-[family-name:var(--font-mono)] antialiased">
        <GlobalGrain />
        {children}
      </body>
    </html>
  );
}
