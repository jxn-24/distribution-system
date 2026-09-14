import type { Metadata } from "next";
import { Outfit, Figtree } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Luna Soft Essentials",
  description:
    "Gentle care. Strong protection. Essential hygiene products and distribution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${figtree.variable} antialiased font-body`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}