'use client';

import { Download, Clock } from 'lucide-react';

interface ResultCardProps {
  title: string;
  artist?: string;
  downloadUrl?: string;
  source?: string;
  thumbnail?: string;
  duration?: number;
}

function formatDuration(duration: number): string {
  const total = Math.floor(duration);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
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
    <div className="border border-base-content/20 bg-base-100 hover:bg-base-200 transition-colors group flex flex-col">
      {/* Thumbnail strip */}
      {thumbnail && (
        <div className="relative h-32 shrink-0 overflow-hidden border-b border-base-content/20">
          <img
            src={thumbnail}
            alt=""
            width={480}
            height={270}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
          {/* Duration overlay */}
          {duration ? (
            <div className="absolute bottom-2 right-2 bg-base-content text-base-100 px-2 py-0.5 text-[10px] uppercase tracking-wider flex items-center gap-1 tabular-nums">
              <Clock className="w-3 h-3" aria-hidden="true" />
              <span className="sr-only">Duration </span>
              {formatDuration(duration)}
            </div>
          ) : null}
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <div className="text-sm font-bold tracking-wide mb-1 leading-tight line-clamp-2 break-words">
          {title}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mb-3 text-[10px] uppercase tracking-widest min-w-0">
          {artist ? (
            <span className="text-base-content/70 truncate">{artist}</span>
          ) : null}
          {source ? (
            <>
              <span className="text-base-content/30 shrink-0">·</span>
              <span className="text-base-content/70 truncate">{source}</span>
            </>
          ) : null}
          {duration && !thumbnail ? (
            <>
              <span className="text-base-content/30 shrink-0">·</span>
              <span className="flex items-center gap-1 text-base-content/70 shrink-0 tabular-nums">
                <Clock className="w-3 h-3" aria-hidden="true" />
                {formatDuration(duration)}
              </span>
            </>
          ) : null}
        </div>

        {/* Action */}
        {downloadUrl ? (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-accent btn-block btn-sm gap-2 mt-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Download
          </a>
        ) : (
          <>
            {/* Visible text, not a disabled control: a disabled button is
                unfocusable, so the message would be invisible to keyboard
                and screen-reader users. */}
            <p className="mt-auto text-[0.65rem] uppercase tracking-widest text-base-content/60 border border-base-content/20 px-3 py-2 text-center">
              No download available
            </p>
          </>
        )}
      </div>
    </div>
  );
}
