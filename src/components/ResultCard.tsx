'use client';

import { Download, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
    <Card className="bg-card group overflow-hidden py-0 transition-shadow hover:shadow-md">
      {/* Thumbnail strip */}
      {thumbnail ? (
        <div className="relative h-40 shrink-0 overflow-hidden">
          {/*
            Deliberately a plain <img>, not next/image. Thumbnails come from
            whatever host the yt-dlp extractor or scraper returns, so
            next/image would need an open-ended remotePatterns list, which
            turns the image optimizer into a proxy that any third party can
            make fetch arbitrary URLs. Fixed width/height and lazy loading
            cover the CLS and bandwidth concerns the rule is really about.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail}
            alt=""
            width={480}
            height={270}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
          />
          {/* Duration overlay */}
          {duration ? (
            <div className="bg-background/85 text-foreground absolute right-2 bottom-2 flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] tabular-nums backdrop-blur-sm">
              <Clock className="size-3" aria-hidden="true" />
              <span className="sr-only">Duration </span>
              {formatDuration(duration)}
            </div>
          ) : null}
        </div>
      ) : null}

      <CardHeader className="gap-0 px-4 pt-4">
        <CardTitle className="line-clamp-2 text-sm leading-snug font-semibold break-words">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        {/* Meta row */}
        <div className="text-muted-foreground mt-1.5 mb-3 flex min-w-0 items-center gap-1.5 text-xs">
          {artist ? <span className="truncate">{artist}</span> : null}
          {source ? (
            <>
              <span className="shrink-0 opacity-50">·</span>
              <span className="truncate">{source}</span>
            </>
          ) : null}
          {duration && !thumbnail ? (
            <>
              <span className="shrink-0 opacity-50">·</span>
              <span className="flex shrink-0 items-center gap-1 tabular-nums">
                <Clock className="size-3" aria-hidden="true" />
                {formatDuration(duration)}
              </span>
            </>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="mt-auto border-t bg-transparent p-4 pt-0">
        {downloadUrl ? (
          <Button
            render={
              // An anchor, not a button: this opens a cross-origin download in
              // a new tab, which is a navigation, not an in-page action. A real
              // <button> would break middle-click, copy-link and the browser's
              // link preview in the status bar.
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer" />
            }
            // Base UI assumes a <button> host by default and warns when the
            // rendered element is not one. This is deliberately a link.
            nativeButton={false}
            variant="secondary"
            className="w-full gap-2 rounded-md"
          >
            <Download data-icon="inline-start" aria-hidden="true" />
            Download
          </Button>
        ) : (
          <>
            {/* Visible text, not a disabled control: a disabled button is
                unfocusable, so the message would be invisible to keyboard
                and screen-reader users. */}
            <p className="text-muted-foreground bg-muted w-full rounded-md px-3 py-2 text-center text-xs">
              No download available
            </p>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
