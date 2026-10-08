import { Music } from 'lucide-react';

export function Footer() {
  // Rendered on the server; the year is stable within a request.
  const year = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground font-mono mt-auto border-t">
      {/* Main footer bar */}
      <div className="px-6 py-4">
        <div className="container mx-auto flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          {/* Left metadata */}
          <div className="space-y-1 text-[10px] opacity-90">
            <div className="flex items-center gap-2">
              <Music className="size-3" aria-hidden="true" />
              <span translate="no">CASSETTE WEB</span>
              <span className="opacity-50">·</span>
              <span>XX1 · XXL</span>
            </div>
            <div>NDFR - 00 NMB 00001 &nbsp; TEL N. 800 003 0000</div>
            <div className="tabular-nums">
              IDENTIFICATION NUMBER - 06746HDFGFS634523 64
            </div>
          </div>

          {/* Right serial */}
          <div className="space-y-1 text-right text-[10px] opacity-90">
            <div className="tabular-nums">SERIAL NO. 000000003214</div>
            <div>
              <span className="tabular-nums">{year}</span> · Built with Next.js
            </div>
          </div>
        </div>
      </div>

      {/*
        Thin bottom accent strip. The gradient is still the one inline style
        in the codebase, per the project convention: it interpolates three
        live token values, which no className expression can express.
      */}
      <div
        className="h-1 w-full"
        style={{
          background:
            'linear-gradient(to right, var(--primary), var(--secondary), var(--accent))',
        }}
        aria-hidden="true"
      />
    </footer>
  );
}
