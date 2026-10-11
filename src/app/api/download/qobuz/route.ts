import { NextRequest, NextResponse } from 'next/server';
import { qobuzScraper } from '@/lib/scrapers/qobuz';

function getContentType(qualityId: string): string {
  switch (qualityId) {
    case 'HI_RES_LOSSLESS':
    case 'HI_RES':
      return 'audio/flac';
    case 'LOSSLESS':
      return 'audio/flac';
    default:
      return 'application/octet-stream';
  }
}

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
    const stream = await qobuzScraper.getDownloadStream(trackId, qualityId, credentials);

    const contentType = getContentType(qualityId);
    const disposition = `attachment; filename="qobuz-${trackId}.flac"`;

    return new NextResponse(stream, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('Qobuz download error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Missing') || error.message.includes('Invalid')) {
        return NextResponse.json(
          { error: 'Invalid or expired credentials for Qobuz. Please update in Settings.' },
          { status: 401 }
        );
      }
      if (error.message.includes('not available')) {
        return NextResponse.json(
          { error: 'Track not available in selected quality on Qobuz.' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to download from Qobuz' },
      { status: 500 }
    );
  }
}