import { NextRequest, NextResponse } from 'next/server';
import { amazonScraper } from '@/lib/scrapers/amazon';

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
    const stream = await amazonScraper.getDownloadStream(trackId, qualityId, credentials);
    const contentType = qualityId.includes('FLAC') ? 'audio/flac' : 
                       qualityId === 'OPUS' ? 'audio/opus' :
                       qualityId.includes('AC3') || qualityId.includes('AC4') ? 'audio/mpeg' :
                       'application/octet-stream';
    const extension = qualityId.includes('FLAC') ? 'flac' : 
                      qualityId === 'OPUS' ? 'opus' : 'm4a';
    const disposition = `attachment; filename="amazon-${trackId}.${extension}"`;

    return new NextResponse(stream, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('Amazon download error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Missing') || error.message.includes('Invalid')) {
        return NextResponse.json(
          { error: 'Invalid or expired credentials for Amazon Music. Please update in Settings.' },
          { status: 401 }
        );
      }
      if (error.message.includes('not available')) {
        return NextResponse.json(
          { error: 'Track not available in selected quality on Amazon Music.' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to download from Amazon Music' },
      { status: 500 }
    );
  }
}