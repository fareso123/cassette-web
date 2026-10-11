import { NextRequest, NextResponse } from 'next/server';
import { securityMiddleware } from './lib/security-middleware';

// This middleware runs on the Edge runtime. Do not import lib/rate-limit
// here: it pulls in @upstash/redis, whose Node build reads process.version
// and is unsupported on Edge. The search route rate-limits independently,
// so an unthrottled pass through here is not a hole — it is one less
// dependency to break the edge bundle.
export async function middleware(request: NextRequest): Promise<NextResponse> {
  return securityMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};