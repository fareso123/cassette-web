import type { Metadata } from 'next';
import { Russo_One, Space_Mono, Inter } from 'next/font/google';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import './globals.css';

// These variable names must NOT collide with the `--font-*` names that
// globals.css's `@theme inline` block maps them into. A self-reference such as
// `--font-sans: var(--font-sans)` is invalid and silently drops the whole
// stack, so the next/font names are kept distinct.
const russoOne = Russo_One({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-russo-one',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'COUNDEX · Music Player',
  description: 'Search songs and find links across YouTube, torrents, and more.',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23ED591A%22 stroke-width=%221.5%22><rect x=%222%22 y=%224%22 width=%2220%22 height=%2216%22/><circle cx=%228%22 cy=%2212%22 r=%222%22/><circle cx=%2216%22 cy=%2212%22 r=%222%22/><line x1=%222%22 y1=%228%22 x2=%2222%22 y2=%228%22/><line x1=%222%22 y1=%2216%22 x2=%2222%22 y2=%2216%22/></svg>',
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
      // No class here: ThemeController sets `.dark` after mount, so the
      // server render stays deterministic.
      suppressHydrationWarning
    >
      {/*
        paper-grain lives on body only. It was previously also on the page
        wrapper, Navbar and Footer, so four 0.04-opacity noise layers stacked
        into visible mottling rather than reading as a subtle texture.
      */}
      <body className="paper-grain bg-background text-foreground font-sans transition-colors duration-300 min-h-screen">
        <a
          href="#main"
          className="focus:bg-background focus:text-foreground focus:border-border sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:border focus:px-4 focus:py-2"
        >
          Skip to content
        </a>

        {/*
          The fixed page-wide "CX" watermark is removed. It duplicated the
          giant background "C" in HeroSection at lower opacity, so the two
          stacked on every screen, and design2.md's "Giant BG" row describes a
          single element.
        */}

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
