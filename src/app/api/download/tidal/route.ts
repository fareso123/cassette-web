import { NextRequest, NextResponse } from 'next/server';
import { tidalScraper } from '@/lib/scrapers/tidal';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const trackId = searchParams.get('trackId');
  const qualityId = searchParams.get('quality');
  const credentialsHeader = request.headers.get('x-source-credentials');

  if (!trackId || !qualityId) {
    return NextResponse.json(
      { error: 'Missing trackId or quality' },
      { status: 400 }
    );
  }

  let credentials: Record<string, string> = {};
  try {
    credentials = credentialsHeader ? JSON.parse(credentialsHeader) : {};
  } catch {
    return NextResponse.json(
      { error: 'Invalid credentials format' },
      { status: 400 }
    );
  }

  try {
    const stream = await tidalScraper.getDownloadStream(trackId, qualityId, credentials);
    const contentType = 'audio/mpeg'; // Tidal returns MP3/M4A
    const disposition = `attachment; filename="tidal-${trackId}.m4a"`;

    return new NextResponse(stream, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('Tidal download error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Missing') || error.message.includes('Invalid')) {
        return NextResponse.json(
          { error: 'Invalid or expired credentials for Tidal. Please update in Settings.' },
          { status: 401 }
        );
      }
      if (error.message.includes('not available')) {
        return NextResponse.json(
          { error: 'Track not available in selected quality on Tidal.' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to download from Tidal' },
      { status: 500 }
    );
  }
}