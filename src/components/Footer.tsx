import { Music } from 'lucide-react';

export function Footer() {
  // Rendered on the server; the year is stable within a request.
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-base-content/20 paper-grain mt-auto font-mono bg-neutral text-neutral-content">
      {/* Main footer bar */}
      <div className="px-6 py-4">
        <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left metadata */}
          <div className="text-[10px] space-y-1 text-neutral-content/80">
            <div className="flex items-center gap-2">
              <Music className="w-3 h-3" aria-hidden="true" />
              <span translate="no">CASSETTE WEB</span>
              <span className="text-neutral-content/50">·</span>
              <span>XX1 · XXL</span>
            </div>
            <div>
              NDFR - 00 NMB 00001 &nbsp; TEL N. 800 003 0000
            </div>
            <div className="tabular-nums">
              IDENTIFICATION NUMBER - 06746HDFGFS634523 64
            </div>
          </div>

          {/* Right serial */}
          <div className="text-[10px] text-neutral-content/80 text-right space-y-1">
            <div className="tabular-nums">
              SERIAL NO. 000000003214
            </div>
            <div>
              <span className="tabular-nums">{year}</span> · Built with Next.js
            </div>
          </div>
        </div>
      </div>

      {/* Thin bottom accent strip */}
      <div
        className="h-1 w-full"
        style={{
          background:
            'linear-gradient(to right, var(--c-bg-green), var(--c-neon), var(--c-cta))',
        }}
        aria-hidden="true"
      />
    </footer>
  );
}
