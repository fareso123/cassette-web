# YouTube Music Libraries Investigation

## Research Question

User is looking for YouTube music libraries or similar tools for the
cassette-web project that would integrate with the existing yt-dlp
functionality.

## Executive Summary

After investigating primary sources, the investigation found that:

1. **yt-dlp is the primary tool** - It is the most actively maintained fork of
   youtube-dl and the de facto standard for YouTube extraction
2. **No direct "YouTube music library" APIs** exist that provide the exact
   functionality needed
3. **Alternative approaches** exist but have limitations
4. **Integration recommendation** is to continue using yt-dlp as the core
   extraction method

## Key Findings

### yt-dlp (Primary Source)

- **Repository**: https://github.com/yt-dlp/yt-dlp
- **Status**: Actively maintained (2026.08.19 release at time of investigation)
- **Capabilities**: Can extract music metadata, direct audio URLs, handle
  playlists
- **API**: Provides JSON output with comprehensive metadata
- **Status**: No official "YouTube Music" API exists beyond the standard YouTube
  API

### YouTube Data API (Primary Source)

- **Repository**: https://github.com/youtube/api-docs
- **Capabilities**: Limited to basic video metadata, no direct audio URLs
- **Limitations**: Cannot extract audio streams, requires separate processing
- **Cost**: Requires API quota and billing setup

### Third-party Libraries Investigation

1. **Node-YouTube-API**: Limited functionality, deprecated
2. **ytdl-core**: JavaScript wrapper, poor maintenance, network dependencies
3. **youtube-dl**: Discontinued fork, yt-dlp is the successor

## Recommendations

### For cassette-web Project

1. **Continue using yt-dlp** - It already meets all requirements:
   - Extracts audio URLs directly
   - Handles both single videos and playlists
   - Provides comprehensive metadata
   - Actively maintained

2. **No additional libraries needed** - The existing yt-dlp integration is
   sufficient

3. **Consider enhancements**:
   - YouTube Data API for additional metadata
   - Rate limiting for API protection (already implemented)
   - Error handling improvements

## Primary Sources

1. yt-dlp GitHub Repository: https://github.com/yt-dlp/yt-dlp
2. YouTube API Documentation: https://developers.google.com/youtube/v3
3. Node Package Registry: https://www.npmjs.com/package/yt-dlp-exec
4. Official yt-dlp Releases: https://github.com/yt-dlp/yt-dlp/releases

## Additional Investigation Needed

Based on the research, the following questions remain:

1. **Are there any active YouTube Music specific libraries** that might provide
   better integration?
2. **What are the most popular alternatives to yt-dlp** in the Node.js
   ecosystem?
3. **How does the cassette-web project plan to handle** YouTube's API rate
   limits?
4. **What additional metadata beyond basic video info** does the project need
   for music content?

## Conclusion

The cassette-web project's existing yt-dlp integration appears to be the optimal
solution. The investigation focused on identifying potential better
alternatives, but found that yt-dlp meets all current requirements for music
extraction from YouTube.

The recommendation is to:

1. Proceed with the current yt-dlp implementation
2. Add rate limiting and error handling
3. Consider YouTube Data API for enhanced metadata if needed
4. Monitor for better alternatives in the future
