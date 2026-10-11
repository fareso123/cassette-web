# Spec: download/credentials

## Purpose

Manage client-side storage and retrieval of user credentials (session tokens, cookies, API keys) required for authenticated download sources, with clear user consent and local-only storage.

## ADDED Requirements

### Requirement: Credential Storage

The application SHALL store user credentials in browser localStorage, scoped per source, with no server-side persistence.

#### Scenario: User enters credentials for a source
- **WHEN** a user provides credentials for a source (Qobuz, Tidal, Amazon, YouTube Music)
- **THEN** credentials SHALL be stored in localStorage under a namespaced key (e.g., `cassette.credentials.qobuz`)
- **THEN** credentials SHALL NOT be sent to the server except as part of a download API request to the same origin
- **THEN** credentials SHALL be retrievable for subsequent downloads without re-entry

#### Scenario: Credentials are cleared
- **WHEN** user clicks "Remove credentials" for a source
- **THEN** the corresponding localStorage entry SHALL be deleted
- **THEN** future downloads from that source SHALL prompt for credentials again

### Requirement: Credential Validation

Before initiating a download, the system SHALL validate that credentials for the selected source exist and are non-empty.

#### Scenario: Download initiated without credentials
- **WHEN** user attempts to download from an authenticated source without stored credentials
- **THEN** the UI SHALL block the download and prompt to enter credentials first
- **THEN** the credential entry form SHALL be accessible from the download resources section or settings

### Requirement: Credential Entry UI

The settings panel SHALL provide a form for each authenticated source where users can paste their session tokens/cookies.

#### Scenario: User opens settings to manage credentials
- **WHEN** user opens the Settings panel
- **THEN** each authenticated source SHALL have a dedicated section with: source name, current status (connected/not connected), text area for pasting credentials, "Save" and "Remove" buttons
- **THEN** help text SHALL explain where to obtain the credentials (e.g., "Copy the `qobuz_session` cookie from browser DevTools")
- **THEN** saved credentials SHALL be masked in the UI (show as `••••••••`)

### Requirement: Credential Scope Isolation

Credentials for one source SHALL never be used for another source's requests.

#### Scenario: Cross-source credential isolation
- **WHEN** making a download request to Tidal
- **THEN** only Tidal credentials from localStorage SHALL be attached
- **THEN** no other source's credentials SHALL be included in the request