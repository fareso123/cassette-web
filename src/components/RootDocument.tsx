'use client';

import { cn } from '@/lib/utils';
import { ThemeProvider, themeClassName, useTheme } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

/**
 * Renders <html> and <body> from a client component so the theme class is part
 * of React's own output for that element. A server-component layout cannot read
 * localStorage, and a client component writing to documentElement.classList
 * loses to the className prop React renders for the same node.
 */
export function RootDocument({
  fontVariables,
  children,
}: {
  fontVariables: string;
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <DocumentShell fontVariables={fontVariables}>{children}</DocumentShell>
    </ThemeProvider>
  );
}

function DocumentShell({
  fontVariables,
  children,
}: {
  fontVariables: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <html
      lang="en"
      className={cn(fontVariables, themeClassName(theme))}
      // The init script in layout.tsx adds the class before hydration; without
      // this React would report the difference as a mismatch.
      suppressHydrationWarning
    >
      {/*
        paper-grain lives here only. It used to also sit on the page wrapper,
        Navbar and Footer, stacking four 0.04-opacity noise layers into
        visible mottling.
      */}
      <body className="paper-grain bg-background text-foreground font-sans min-h-screen">
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

        <div className="relative z-10 flex min-h-screen flex-col">
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
