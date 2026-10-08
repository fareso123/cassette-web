'use client';

import { ThemeController } from './ThemeController';

export function Navbar() {
  return (
    <nav aria-label="Main" className="border-border bg-background/80 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        {/*
          Logo slot, empty pending design. Kept as a fixed-size box so the
          header does not reflow when the real mark lands, and kept out of the
          accessibility tree because it is not yet meaningful.
        */}
        <div
          className="border-border text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md border border-dashed text-[9px] tracking-widest"
          aria-hidden="true"
        >
          LOGO
        </div>

        <ThemeController />
      </div>
    </nav>
  );
}
