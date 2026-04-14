import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from 'next/link';
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
  title: "AttendX",
  description: "Smart Attendance Tracker with Timetable & Predictions",
  manifest: "/manifest.json",
  themeColor: "#a78bfa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ borderBottom: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface)' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px' }}>
            <Link href="/" className="text-primary" style={{ fontSize: '1.25rem', fontWeight: 600, textDecoration: 'none' }}>
              AttendX
            </Link>
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/" style={{ color: 'var(--on-surface)', textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
              <Link href="/timetable" style={{ color: 'var(--on-surface)', textDecoration: 'none', fontWeight: 500 }}>Timetable</Link>
              <Link href="/subjects" style={{ color: 'var(--on-surface)', textDecoration: 'none', fontWeight: 500 }}>Subjects</Link>
              <Link href="/analytics" style={{ color: 'var(--on-surface)', textDecoration: 'none', fontWeight: 500 }}>Analytics</Link>
              <Link href="/predictions" style={{ color: 'var(--on-surface)', textDecoration: 'none', fontWeight: 500 }}>Predictions</Link>
            </nav>
          </div>
        </header>
        <main style={{ flex: 1 }}>{children}</main>
      </body>
    </html>
  );
}
