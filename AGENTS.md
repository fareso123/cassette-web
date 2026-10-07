# Repository Guidelines

## Project Overview

**Cassette Web** is a multi-user music search/link resolver website with integrated security, rate limiting, modern yt-dlp integration, and modular scraper framework for searching songs across multiple platforms.

Key Features:
- Security-first approach with Cloudflare Turnstile captcha
- Serverless rate limiting using Upstash Ratelimit  
- PostgreSQL + Drizzle ORM with type safety
- Modular scraper architecture supporting music sites (Zaycev.net, MP3Juices) and torrent sites (1337x, RARBG, The Pirate Bay)
- yt-dlp integration for YouTube audio extraction
- Session-based authentication without full auth stack

## Architecture & Data Flow

### High-Level Structure
```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Main search dashboard
└── api/                    # API routes
    └── search/route.ts     # Unified search API

components/                # React component library
├── SearchBar.tsx          # Search interface with URL/song toggle
├── ResultsTabs.tsx        # Organized results display  
└── ResultCard.tsx         # Individual result cards with metadata

lib/                       # Core application logic
├── turnstile.ts           # Cloudflare Turnstile verification
├── security-middleware.ts # Security headers middleware
├── rate-limit.ts          # Rate limiting middleware
├── session.ts             # Session management
├── extractors/            # yt-dlp extraction services
│   └── yt-dlp.ts
├── scrapers/              # Modular scraper framework
│   ├── types.ts           # Scraper type definitions
│   ├── registry.ts        # Scraper registration
│   ├── base.ts            # Base scraper class
│   ├── music-sites.ts     # Music site scrapers
│   ├── torrent-sites.ts   # Torrent site scrapers
│   └── soundcloud.ts      # SoundCloud scraper
└── utils/                 # Utility functions

types/                     # Type definitions
├── extracted.ts           # yt-dlp result types
├── scraped.ts             # Scraper result types  
└── search.ts             # Search API types

__tests__/                # Test files
├── security-infrastructure.test.ts
├── security-schema.test.ts
├── session.test.ts
├── youtube-utils.test.ts
├── yt-dlp-extractor.test.ts
└── search-api.test.ts
```

### Data Flow
1. **User Input** → Search Component → Search API Route
2. **Search API** → Type Dispatch (YouTube URL vs Song Query)
3. **Processing** → yt-dlp Service OR Scraper Service
4. **Results** → Process through middlewares (rate limiting, security)
5. **Response** → Formatted Results Component

## Key Directories

### `app/` - Next.js Application
- `layout.tsx` - Root component providing consistent layout
- `page.tsx` - Main search dashboard interface
- `api/` - Server-side API routes with rate limiting and security

### `components/` - React Component Library
- `SearchBar.tsx` - Dual-mode search interface with URL/song toggle
- `ResultsTabs.tsx` - Organized tabbed results display
- `ResultCard.tsx` - Individual result cards with metadata (thumbnail, artist, duration, source)

### `lib/` - Core Application Logic
- **Security**: `turnstile.ts`, `security-middleware.ts`, `rate-limit.ts`, `session.ts`
- **Extraction**: `extractors/yt-dlp.ts` - YouTube audio extraction service
- **Scraping**: `scrapers/` - Modular framework for site-specific scrapers
- **Utilities**: Common functions and helpers

### `types/` - Type Safety
- `extracted.ts` - yt-dlp extraction result types
- `scraped.ts` - Generic scraper result types  
- `search.ts` - Search API request/response types

### `__tests__/` - Testing
- Comprehensive test coverage for security infrastructure
- Unit tests for individual components and services
- Integration tests for search functionality

## Development Commands

### Install & Run
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Production start
npm start
```

### Code Quality
```bash
# Format code with Prettier
npm run format

# Check formatting
npm run format:check

# Lint code with ESLint
npm run lint

# Check linting
npm run lint:check
```

### Testing
```bash
# Run all tests
npm test

# Run specific test file
npm test src/__tests__/security-infrastructure.test.ts -v

# Watch mode for development
npm run test:watch
```

### Database & Migration
```bash
# Push database schema
npm run db:push

# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Database studio
npm run db:studio
```

## Code Conventions & Common Patterns

### Naming Conventions
- **Components**: `PascalCase` (e.g., `SearchBar`, `ResultCard`)
- **Functions**: `camelCase` (e.g., `verifyToken`, `processSearch`)
- **Variables**: `camelCase` (e.g., `apiUrl`, `timeoutMs`)
- **Types/Interfaces**: `PascalCase` (e.g., `SearchResult`, `ScraperConfig`)

### File Organization
```
// Consistent import order
1. React/React-native imports
2. Next.js internal imports  
3. Third-party libraries
4. Local application imports
5. Type imports
```

### Error Handling
```typescript
// Centralized error handling in API routes
try {
  const result = await service.processRequest(request);
  return NextResponse.json(result);
} catch (error) {
  log.error('Request processing failed', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### Security Middleware Pattern
```typescript
// Applied to all routes via Next.js middleware
export async function middleware(request: NextRequest) {
  // Apply security headers
  const response = securityMiddleware(request);
  
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const rateLimitResult = checkRateLimit(request);
    if (!rateLimitResult.allowed) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }
  
  return response;
}
```

### Async Patterns
```typescript
// Consistent async/await usage
async function fetchData(url: string): Promise<Data> {
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    log.error('Data fetch failed', error);
    throw error;
  }
}
```

## Important Files

### Entry Points
- `app/layout.tsx` - Root layout component
- `app/page.tsx` - Main search interface
- `src/app/api/search/route.ts` - Unified search API

### Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `src/app/globals.css` - Tailwind CSS + DaisyUI setup
- `.env.example` - Environment variables template

### Key Modules
- `src/lib/turnstile.ts` - Cloudflare Turnstile verification
- `src/lib/security-middleware.ts` - Security headers middleware
- `src/lib/rate-limit.ts` - Rate limiting implementation
- `src/lib/extractors/yt-dlp.ts` - YouTube audio extraction
- `src/lib/scrapers/` - Complete scraper framework

## Runtime/Tooling Preferences

### Required Runtime
- **Node.js**: >= 26.0.0 (as specified in `package.json`)
- **Browser**: Modern (ES2022+ compatibility)

### Package Manager
- **Primary**: npm (configured in scripts)
- **Installation**: `npm install`
- **Management**: npm scripts for all operations

### Tooling Constraints
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with Next.js configuration
- **Formatting**: Prettier with consistent formatting
- **Testing**: Jest with React Testing Library
- **Styling**: Tailwind CSS 4 + DaisyUI 5
- **Build**: Next.js 15.5.26

### Development Environment
```bash
# Required environment variables
DATABASE_URL=postgresql://user:password@localhost:5432/cassette-web
NEXTAUTH_SECRET=your-secret-key-here-must-be-at-least-32-chars
NEXTAUTH_URL=http://localhost:3000
YT_DLP_PATH=yt-dlp.exe
FFMPEG_PATH=ffmpeg.exe
UPSTASH_REDIS_URL=https://your-redis.upstash.io
UPSTASH_REDIS_TOKEN=your-redis-token
TURNSTILE_SITE_KEY=your-turnstile-site-key
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
NODE_ENV=development
```

## Testing & QA

### Test Framework
- **Framework**: Jest + React Testing Library
- **Configuration**: Custom Jest setup for Next.js
- **Coverage**: Comprehensive test coverage expected

### Test Structure
```typescript
// Test file example
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBar } from '../SearchBar';

describe('SearchBar Component', () => {
  test('renders search input and toggle buttons', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Song' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'YouTube URL' })).toBeInTheDocument();
  });
  
  test('switches between song and URL search modes', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'YouTube URL' }));
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('YouTube URL...')).toBeInTheDocument();
    });
  });
});
```

### Testing Commands
```bash
# Run all tests with verbose output
npm test

# Run specific test category
npm test src/__tests__/security-infrastructure.test.ts -v

# Watch mode for development
npm run test:watch

# Test coverage report
npm run test -- --coverage
```

### Coverage Expectations
- **Component Tests**: Unit tests for all React components
- **Security Tests**: Comprehensive security infrastructure validation
- **Integration Tests**: End-to-end search flow testing
- **Error Handling**: Robust error testing
- **Performance**: Load and stress testing

## Configuration Notes

### Environment Setup
- **Development**: Local PostgreSQL database
- **Production**: Upstash Redis for rate limiting
- **Security**: Cloudflare Turnstile for bot protection
- **Build**: Optimized Next.js configuration

### Build Optimization
- **Image Handling**: Next.js image optimization
- **Code Splitting**: Component lazy loading
- **Caching**: Application-level caching strategies
- **CDN**: Static asset delivery optimization

This document provides comprehensive guidance for working with the Cassette Web project, ensuring consistent development practices and successful implementation of the modular scraper framework with security-first approach.