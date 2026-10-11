import { NextRequest, NextResponse } from 'next/server';
import { ytmusicScraper } from '@/lib/scrapers/ytmusic';

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
    const stream = await ytmusicScraper.getDownloadStream(trackId, qualityId, credentials);
    const contentType = qualityId === 'LOW' ? 'audio/opus' : 'audio/mp4';
    const extension = qualityId === 'LOW' ? 'opus' : 'm4a';
    const disposition = `attachment; filename="ytmusic-${trackId}.${extension}"`;

    return new NextResponse(stream, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('YouTube Music download error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Missing') || error.message.includes('Invalid')) {
        return NextResponse.json(
          { error: 'Invalid or expired credentials for YouTube Music. Please update in Settings.' },
          { status: 401 }
        );
      }
      if (error.message.includes('not available')) {
        return NextResponse.json(
          { error: 'Track not available in selected quality on YouTube Music.' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to download from YouTube Music' },
      { status: 500 }
    );
  }
}