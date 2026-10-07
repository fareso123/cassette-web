import type { Metadata } from 'next';
import { Russo_One, Space_Mono, Inter } from 'next/font/google';
import { ThemeController } from '@/components/ThemeController';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import './globals.css';

const russoOne = Russo_One({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'COUNDEX · MUSIC PLAYER',
  description: 'Search songs and find links across YouTube, torrents, and more.',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23ED591A%22 stroke-width=%221.5%22><rect x=%222%22 y=%224%22 width=%2220%22 height=%2216%22/%3E<circle cx=%228%22 cy=%2212%22 r=%222%22/%3E<circle cx=%2216%22 cy=%2212%22 r=%222%22/%3E<line x1=%222%22 y1=%228%22 x2=%2222%22 y2=%228%22/%3E<line x1=%222%22 y1=%2216%22 x2=%2222%22 y2=%2216%22/%3E</svg>',
        type: 'image/svg+xml',
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
    <html
      lang="en"
      className={`${russoOne.variable} ${spaceMono.variable} ${inter.variable}`}
      suppressHydrationWarning
      data-theme="cassette"
    >
      <body className="min-h-screen font-sans transition-colors duration-300 paper-grain" style={{ colorScheme: 'light' }}>
        {/* Giant background decorative text */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none select-none z-0 flex items-center justify-center overflow-hidden"
          style={{ opacity: '0.04' }}
        >
          <span
            className="font-display text-[30vw] leading-none tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            CX
          </span>
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
