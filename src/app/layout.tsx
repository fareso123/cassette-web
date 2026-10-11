import type { Metadata } from 'next';
import Script from 'next/script';
import { Russo_One, Space_Mono, Inter } from 'next/font/google';
import { RootDocument } from '@/components/RootDocument';
import { themeInitScript } from '@/components/ThemeProvider';
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
  title: 'Music Player',
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
    <>
      {/*
        Applies the stored theme before first paint. Without it a returning
        dark-theme visitor gets a full light flash before hydration.
      */}
      <Script id="theme-init" strategy="beforeInteractive">
        {themeInitScript}
      </Script>
      <RootDocument
        fontVariables={`${russoOne.variable} ${spaceMono.variable} ${inter.variable}`}
      >
        {children}
      </RootDocument>
    </>
  );
}
