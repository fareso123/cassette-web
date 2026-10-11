# Spec: download/streaming

## Purpose

Stream audio files directly to the browser via Next.js API routes without server-side persistence, enabling immediate downloads while keeping server resource usage minimal.

## ADDED Requirements

### Requirement: Direct Browser Streaming

Download requests SHALL stream the audio content from the source directly to the browser's download mechanism via a Next.js API route, without saving to the server's filesystem.

#### Scenario: User initiates download
- **WHEN** user clicks download for a track/source/quality
- **THEN** the frontend SHALL call `/api/download/{source}?trackId={id}&quality={qualityId}`
- **THEN** the API route SHALL fetch the stream from the source using stored credentials
- **THEN** the API route SHALL pipe the response to the client with appropriate headers (`Content-Disposition: attachment`, `Content-Type: audio/flac`, etc.)
- **THEN** the browser SHALL present a native "Save As" dialog

### Requirement: Credential Injection

The API route SHALL inject the user's stored credentials for the source into the upstream request.

#### Scenario: Authenticated source download
- **WHEN** download API route is called for Qobuz
- **THEN** the route SHALL read Qobuz credentials from the request (passed via header or body from client)
- **THEN** the route SHALL attach credentials to the upstream Qobuz API request
- **THEN** credentials SHALL NOT be logged or persisted server-side

### Requirement: Stream Error Handling

Download failures SHALL be communicated to the client with actionable error messages.

#### Scenario: Upstream source returns error
- **WHEN** the source API returns 401 (invalid credentials)
- **THEN** the API route SHALL return 401 with message "Invalid or expired credentials for {source}. Please update in Settings."
- **WHEN** the source API returns 403/404 (track unavailable)
- **THEN** the API route SHALL return 404 with message "Track not available in selected quality on {source}."
- **WHEN** the source API returns 429 (rate limited)
- **THEN** the API route SHALL return 429 with retry-after header

### Requirement: Progress Feedback

The UI SHALL provide visual feedback during download initiation and streaming.

#### Scenario: Download in progress
- **WHEN** download is initiated
- **THEN** the UI SHALL show a loading state on the download button
- **THEN** on success, the button SHALL show "Downloaded" briefly then reset
- **THEN** on failure, the button SHALL show error toast with the message from the API

### Requirement: DMCA Notice

All download interactions SHALL be accompanied by a DMCA/personal-use notice in the page footer.

#### Scenario: Footer displays DMCA notice
- **WHEN** any page with download capability is rendered
- **THEN** the footer SHALL include: "Downloads are for personal archival use only. Respect copyright and terms of service of each source."
- **THEN** the notice SHALL be visible but unobtrusive (small text, muted color)