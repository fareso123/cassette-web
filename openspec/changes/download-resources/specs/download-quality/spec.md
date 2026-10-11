# Spec: download/quality

## Purpose

Provide a global quality preference with per-source overrides so users can control the default audio quality tier for downloads across all sources while allowing fine-tuned control per provider.

## ADDED Requirements

### Requirement: Global Quality Preference

The application SHALL maintain a single global quality preference that applies as the default for all sources.

#### Scenario: User sets global quality
- **WHEN** user selects a global quality tier (e.g., "FLAC Best Available", "MP3 320kbps", "Auto-best")
- **THEN** the preference SHALL be stored in localStorage (e.g., `cassette.download.quality.global`)
- **THEN** this preference SHALL be used as the default when initiating downloads from any source

#### Scenario: Global quality options
- **WHEN** presenting the global quality selector
- **THEN** options SHALL include at minimum: "Best Available (Lossless)", "FLAC 24-bit", "FLAC 16-bit", "MP3 320kbps", "Auto (source decides)"

### Requirement: Per-Source Quality Override

The application SHALL allow users to override the global preference for individual sources.

#### Scenario: User sets per-source override
- **WHEN** user configures a different quality for Qobuz than the global setting
- **THEN** the override SHALL be stored in localStorage (e.g., `cassette.download.quality.qobuz`)
- **THEN** when downloading from Qobuz, the override SHALL take precedence over global
- **WHEN** no override exists for a source
- **THEN** the global preference SHALL be used

### Requirement: Quality Availability Filtering

The selected quality preference SHALL be filtered against what the source actually offers for a specific track.

#### Scenario: Track only available in lower quality
- **WHEN** user's preference is "FLAC 24-bit" but the track is only available in "FLAC 16-bit"
- **THEN** the download SHALL use the highest available quality that meets or is below the preference
- **THEN** the UI SHALL indicate the actual quality being downloaded (e.g., "Downloading FLAC 16-bit — 24-bit not available for this track")

### Requirement: Quality Display in Download Resources

The download resources section SHALL show the user's effective quality for each source (global or override) alongside the source's available options.

#### Scenario: Download resources panel shows effective quality
- **WHEN** user expands download resources for a track
- **THEN** each source SHALL display: available qualities, user's effective quality (global or override), and which quality will be used for this track