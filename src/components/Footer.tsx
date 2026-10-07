import { Music } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="border-t border-base-content/20 paper-grain mt-auto"
      style={{ fontFamily: 'var(--font-mono)', background: 'var(--c-dark-box)' }}
    >
      {/* Main footer bar */}
      <div className="px-6 py-4">
        <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left metadata */}
          <div className="text-[10px] text-base-content/40 space-y-1">
            <div className="flex items-center gap-2 opacity-50">
              <Music className="w-3 h-3" aria-hidden="true" />
              <span>CASSETTE WEB</span>
              <span className="text-base-content/30">·</span>
              <span>XX1 · XXL</span>
            </div>
            <div className="opacity-40">
              NDFR - 00 NMB 00001 &nbsp; TEL N. 800 003 0000
            </div>
            <div className="opacity-40">
              IDENTIFICATION NUMBER - 06746HDFGFS634523 64
            </div>
          </div>

          {/* Center CTA */}
          <button
            className="btn btn-accent btn-sm normal-case tracking-widest px-8"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}
          >
            ---BUY NOW---
          </button>

          {/* Right serial */}
          <div className="text-[10px] text-base-content/40 text-right space-y-1">
            <div className="opacity-50">SERIAL NO. 000000003214</div>
            <div className="opacity-40">{year} · MADE WITH · REACT + NEXT.JS</div>
          </div>
        </div>
      </div>

      {/* Thin bottom accent strip */}
      <div
        className="h-1 w-full"
        style={{ background: 'linear-gradient(to right, var(--c-bg-green), var(--c-neon), var(--c-cta))' }}
        aria-hidden="true"
      />
    </footer>
  );
}
