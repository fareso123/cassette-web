# Spec: download/resources

## Purpose

Present available download sources and qualities for each search result, allowing users to discover and initiate downloads from multiple providers (YouTube Music, Qobuz, Tidal, Amazon Music) directly from the search UI.

## ADDED Requirements

### Requirement: Download Resources Discovery

When a user searches for a song, the search results SHALL include download resource metadata for each result indicating which sources can provide the track and at what quality tiers.

#### Scenario: Search result includes download metadata
- **WHEN** a song search returns results
- **THEN** each result MAY include a `downloadResources` array listing available sources and their quality options
- **THEN** each download resource entry SHALL include: `sourceId`, `sourceDisplayName`, `qualityOptions` (array of quality tiers with `id`, `label`, `kind`), `requiresAuth` (boolean)

### Requirement: Download Resources Display

The UI SHALL present download resources as an expandable section in the search results, showing available sources and qualities without requiring a separate page navigation.

#### Scenario: User expands download section for a result
- **WHEN** a result has download resources and the user clicks the download expander
- **THEN** the UI SHALL display a list of sources with their available quality options
- **THEN** each quality option SHALL show: quality label, kind (lossless/lossy/spatial), estimated file size
- **THEN** if a source requires authentication and user has no credentials stored, it SHALL be marked with a lock icon and prompt for credentials

### Requirement: Source Availability Tracking

The system SHALL track which sources are currently available (healthy) and display degraded status when a source's health check fails.

#### Scenario: Source health affects display
- **WHEN** a source's health endpoint returns unhealthy
- **THEN** that source's download resources SHALL be hidden or marked unavailable
- **THEN** the UI SHALL NOT allow initiating downloads from unavailable sources