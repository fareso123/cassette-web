'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ScrollAreaProps extends React.ComponentProps<'div'> {
  className?: string;
}

/**
 * A minimal scroll container. shadcn's ScrollArea wraps a native scrollbar
 * with custom styling via a ScrollBar primitive, but for the queue panel a
 * plain scrollable region is enough — the panel already has a backdrop and
 * the native scrollbar is fine here.
 */
function ScrollArea({ className, ...props }: ScrollAreaProps) {
  return (
    <div
      data-slot="scroll-area"
      className={cn('relative overflow-auto', className)}
      {...props}
    />
  );
}

export { ScrollArea };