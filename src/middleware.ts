import { NextRequest, NextResponse } from 'next/server';
import { securityMiddleware } from './lib/security-middleware';
import { checkRateLimit } from './lib/rate-limit';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Apply security headers to all requests
  const response = securityMiddleware(request);
  
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(`search:${ip}`);
    if (!rateLimitResult.success) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};