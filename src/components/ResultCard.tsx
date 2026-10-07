'use client';

import { Download, Music, Clock } from 'lucide-react';

interface ResultCardProps {
  title: string;
  artist?: string;
  downloadUrl?: string;
  source?: string;
  thumbnail?: string;
  duration?: number;
}

export function ResultCard({
  title,
  artist,
  downloadUrl,
  source,
  thumbnail,
  duration,
}: ResultCardProps) {
  return (
    <div
      className="border border-base-content/20 bg-base-100 hover:bg-base-200 transition-colors group"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {/* Thumbnail strip */}
      {thumbnail && (
        <div className="relative h-32 overflow-hidden border-b border-base-content/20">
          <img
            src={thumbnail}
            alt={`${title} thumbnail`}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
          {/* Duration overlay */}
          {duration && (
            <div
              className="absolute bottom-2 right-2 bg-base-content/80 text-base-100 px-2 py-0.5 text-[10px] uppercase tracking-wider flex items-center gap-1"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <Clock className="w-3 h-3" />
              {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Title */}
        <div className="text-sm font-bold uppercase tracking-wider mb-1 leading-tight">
          {title}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mb-3 text-[10px] uppercase tracking-widest">
          {artist && (
            <span className="text-base-content/60 truncate">{artist}</span>
          )}
          {source && (
            <>
              <span className="text-base-content/30">·</span>
              <span className="text-base-content/50">{source}</span>
            </>
          )}
          {duration && !thumbnail && (
            <>
              <span className="text-base-content/30">·</span>
              <span className="flex items-center gap-1 text-base-content/50">
                <Clock className="w-3 h-3" />
                {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
              </span>
            </>
          )}
        </div>

        {/* Action */}
        {downloadUrl ? (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-accent btn-block btn-sm normal-case tracking-widest gap-2"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}
          >
            <Download className="w-3.5 h-3.5" />
            DOWNLOAD
          </a>
        ) : (
          <button
            className="btn btn-block btn-sm btn-ghost normal-case tracking-widest gap-2 cursor-not-allowed"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}
            disabled
          >
            <Download className="w-3.5 h-3.5" />
            NO DOWNLOAD AVAILABLE
          </button>
        )}
      </div>
    </div>
  );
}
