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
  title: "Futsal Organizer",
  description: "Organize futsal games, split costs, track payments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <header className="bg-surface sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-5 py-3.5 flex items-center gap-2.5">
            <span className="text-xl">&#9917;</span>
            <a href="/" className="font-bold text-[17px] tracking-tight text-foreground">
              Futsal Organizer
            </a>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-5 py-5">{children}</main>
      </body>
    </html>
  );
}
