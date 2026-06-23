# Requirements Document

## Introduction

This document defines the requirements for refactoring the large page components in the ai-website-generator project. Multiple page files have grown too large with inline components, duplicate logic, and unused hooks. The refactoring aims to:

1. Extract inline components to separate reusable files
2. Create custom hooks for reusable stateful logic
3. Update and use the existing `useSSEStream` hook (currently unused) for SSE stream handling
4. Reduce all large page files to manageable sizes (under 300-400 lines each)
5. Maintain use of the `eventsource-parser` library with `createParser` and `reset({ consume: true })`
6. Eliminate duplicate inline components across pages

### Page Analysis Summary

| Page | Current Lines | Target | Issues |
|------|---------------|--------|--------|
| `website/[id]/page.tsx` | 1212 | <400 | Inline LoadingSpinner, WebsiteNotFound, sanitizeFilename, complex beautify/auto-save logic |
| `generate/page.tsx` | ~600 | <400 | Duplicate SSE streaming code, unused useSSEStream hook |
| `page.tsx` (Login) | 461 | <300 | Inline GoogleIcon, GoogleSignInButton, ErrorAlert, ShowcaseCard, CommunityShowcase |
| `dashboard/page.tsx` | 397 | <300 | Inline LoadingSpinner (duplicate), ShowcaseLink |
| `showcase/page.tsx` | 243 | <200 | Inline WebsiteCardSkeleton, EmptyState, WebsiteCard (similar to dashboard) |

## Glossary

- **Website_Page**: The `src/app/website/[id]/page.tsx` component that displays website preview and code editor
- **Generate_Page**: The `src/app/generate/page.tsx` component that handles website generation from text or screenshot
- **Login_Page**: The `src/app/page.tsx` component - the public landing page with sign-in
- **Dashboard_Page**: The `src/app/dashboard/page.tsx` component that lists user's websites
- **Showcase_Page**: The `src/app/showcase/page.tsx` component that displays community showcase
- **SSE_Stream**: Server-Sent Events stream used for real-time content streaming from generation/beautify APIs
- **useSSEStream_Hook**: The existing custom hook at `src/hooks/useSSEStream.ts` for handling SSE streams
- **Beautify_Workflow**: The process of enhancing website HTML/CSS via AI streaming
- **Auto_Save**: Automatic saving of editor modifications after a debounce delay
- **Component_Extraction**: Moving inline component definitions to separate files
- **Hook_Extraction**: Moving reusable stateful logic into custom React hooks
- **eventsource_parser**: The npm library used for parsing SSE events with `createParser` API
- **Utilities_Module**: Centralized utility functions at `src/utils/`

## Requirements

### Requirement 1: Extract LoadingSpinner Component

**User Story:** As a developer, I want the LoadingSpinner component extracted to a single shared file, so that it can be reused across all pages and eliminate duplicate implementations.

#### Acceptance Criteria

1. THE Component_Extraction SHALL create a `LoadingSpinner` component file at `src/components/common/LoadingSpinner.tsx`
2. THE LoadingSpinner component SHALL accept an optional `message` prop of type string with a maximum length of 100 characters for customizable loading text, defaulting to "Loading..." when not provided
3. THE LoadingSpinner component SHALL render a centered layout containing a 40x40 pixel circular spinner with a spinning animation using the primary color theme, and display the message text below the spinner in muted-foreground color
4. THE LoadingSpinner component SHALL accept an optional `fullScreen` prop that, when true, renders with minimum full viewport height, and when false or omitted, renders with minimum height of 400 pixels
5. THE LoadingSpinner component SHALL replace the inline LoadingSpinner implementations in Website_Page, Dashboard_Page, and Login_Page
6. THE LoadingSpinner component SHALL be exported from `src/components/common/index.ts`

### Requirement 2: Extract WebsiteNotFound Component

**User Story:** As a developer, I want the WebsiteNotFound component extracted to a separate file, so that it can be reused and tested independently.

#### Acceptance Criteria

1. THE Component_Extraction SHALL create a `WebsiteNotFound` component file at `src/components/common/WebsiteNotFound.tsx`
2. THE WebsiteNotFound component SHALL accept an optional `onNavigateBack` callback prop that, when provided, is invoked on navigation button click, and when omitted, defaults to navigating to `/dashboard`
3. THE WebsiteNotFound component SHALL render an icon (circular background with X symbol), a heading displaying "Website not found", a description paragraph, and a "Back to Dashboard" navigation button
4. THE WebsiteNotFound component SHALL export a `WebsiteNotFoundProps` interface defining the optional `onNavigateBack` callback prop with type `() => void`
5. WHEN the WebsiteNotFound component is imported and rendered in Website_Page, THE Website_Page SHALL produce the same visual output and navigation behavior as the original inline implementation
6. THE WebsiteNotFound component SHALL be exported as a named export from `src/components/common/index.ts` along with its `WebsiteNotFoundProps` type

### Requirement 3: Extract sanitizeFilename Utility

**User Story:** As a developer, I want the sanitizeFilename utility function moved to a utilities module, so that filename sanitization logic is centralized and reusable.

#### Acceptance Criteria

1. THE Utilities_Module SHALL export a sanitizeFilename function from `src/utils/filename.ts`
2. THE sanitizeFilename function SHALL accept a title string parameter and return a sanitized filename string
3. THE sanitizeFilename function SHALL transform the input by: converting to lowercase, removing characters not matching the pattern [a-z0-9\s-], replacing whitespace sequences with single hyphens, collapsing consecutive hyphens into a single hyphen, and truncating the result to a maximum of 50 characters, applied in that order
4. IF the sanitization process results in an empty string, THEN THE sanitizeFilename function SHALL return the fallback value 'website'
5. THE Website_Page component SHALL import and use the sanitizeFilename function from `src/utils/filename.ts` for download operations
6. THE DownloadDialog component SHALL import and use the sanitizeFilename function from `src/utils/filename.ts` for generating download filenames

### Requirement 4: Rewrite useSSEStream Hook with eventsource-parser Library

**User Story:** As a developer, I want the useSSEStream hook completely rewritten to use the eventsource-parser library and support result accumulation, so that SSE parsing is robust and both generation and beautification workflows can use it.

#### Acceptance Criteria

1. THE Hook_Extraction SHALL delete the existing `src/hooks/useSSEStream.ts` file and create a new implementation from scratch
2. THE new useSSEStream_Hook SHALL import `createParser` from 'eventsource-parser' and use it for all SSE event parsing instead of manual line-based parsing
3. THE useSSEStream_Hook SHALL create a parser instance using `createParser({ onEvent: (event) => {...} })` to receive parsed events where each event has `event` (type) and `data` (payload string) properties
4. THE useSSEStream_Hook SHALL call `parser.feed(decodedChunk)` for each chunk received from the stream reader
5. WHEN the stream reader signals completion (done is true), THE useSSEStream_Hook SHALL call `parser.reset({ consume: true })` to flush any remaining buffered data before marking the stream as complete
6. THE useSSEStream_Hook SHALL accept an optional `onTextChunk` callback that is invoked each time an SSE event with type 'text' is received and the parsed data contains a `content` property
7. WHEN a 'done' event is received AND the parsed event data contains a `result` property, THEN THE useSSEStream_Hook SHALL invoke the optional `onResult` callback with the value of that `result` property
8. THE useSSEStream_Hook SHALL expose a `result` state initialized to `null` that is updated to contain the `result` property from the 'done' event data when present
9. THE useSSEStream_Hook SHALL continue to accept and invoke the existing `onEvent` callback for every parsed SSE event, preserving the current callback signature with `{ type: string, data: unknown }`
10. THE useSSEStream_Hook SHALL maintain the existing return interface: `isStreaming`, `error`, `streamingContent`, `start`, `cancel`
11. THE useSSEStream_Hook SHALL maintain the existing abort behavior: calling `cancel()` aborts the request without setting error state
12. THE existing test file `src/hooks/useSSEStream.test.ts` SHALL be updated to reflect the new eventsource-parser-based implementation while preserving test coverage for existing behaviors

### Requirement 5: Create useAutoSave Hook

**User Story:** As a developer, I want auto-save logic extracted into a custom hook, so that editor auto-save behavior is reusable and the website page is smaller.

#### Acceptance Criteria

1. THE useAutoSave hook SHALL be located at `src/hooks/useAutoSave.ts`
2. THE useAutoSave hook SHALL accept a generic type parameter for values and accept options including: current values, original values, an async save callback that receives the current values, and a delay parameter between 100 and 30000 milliseconds
3. THE useAutoSave hook SHALL return `hasUnsavedChanges` (boolean), `isSaving` (boolean), `saveError` (string or null), `lastSaved` (Date or null, initially null), and a manual `save` function
4. WHEN current values differ from original values using deep equality comparison for longer than the specified delay period, THE useAutoSave hook SHALL invoke the save callback with the current values
5. WHEN the save callback Promise resolves successfully, THE useAutoSave hook SHALL update `lastSaved` to the current timestamp and set `hasUnsavedChanges` to false
6. IF the save callback Promise rejects, THEN THE useAutoSave hook SHALL set `saveError` with the error message extracted from the rejection reason and retain `hasUnsavedChanges` as true
7. WHEN current values change, THE useAutoSave hook SHALL reset the pending save timeout to restart the delay period
8. IF a save operation is in progress when a new auto-save would trigger, THEN THE useAutoSave hook SHALL wait for the current save to complete before starting a new save with the latest values
9. WHEN the component unmounts, THE useAutoSave hook SHALL clear any pending save timeout to prevent memory leaks

### Requirement 6: Create useBeautifyWorkflow Hook

**User Story:** As a developer, I want beautify workflow state and logic extracted into a custom hook, so that the complex beautification process is encapsulated and testable.

#### Acceptance Criteria

1. THE Hook_Extraction SHALL create a `useBeautifyWorkflow` hook at `src/hooks/useBeautifyWorkflow.ts`
2. THE useBeautifyWorkflow hook SHALL accept input parameters: `websiteId` (string), `currentHtml` (string), `currentCss` (string), and `originalPrompt` (string or null)
3. THE useBeautifyWorkflow hook SHALL manage states with initial values: `isBeautifying` (false), `beautifyStage` (null), `streamingContent` (empty string), `beautifiedHtml` (empty string), `beautifiedCss` (empty string), `beautifyError` (null)
4. THE useBeautifyWorkflow hook SHALL manage dialog visibility states with initial values: `showBeautifyOptions` (false), `showPreviewComparison` (false), `showSaveOptions` (false)
5. THE useBeautifyWorkflow hook SHALL expose a `startBeautify` function that accepts `BeautifyDialogResult` (containing optional `referenceImage` and `referenceImageMimeType`) and initiates the streaming beautification request using the provided website data
6. THE useBeautifyWorkflow hook SHALL expose a `cancelBeautify` function that aborts the ongoing request and resets `isBeautifying` to false
7. THE useBeautifyWorkflow hook SHALL expose `handleConfirm` that sets `showBeautifyOptions` to false and calls `startBeautify` with the dialog result
8. THE useBeautifyWorkflow hook SHALL expose `handleAccept` that sets `showPreviewComparison` to false and sets `showSaveOptions` to true
9. THE useBeautifyWorkflow hook SHALL expose `handleReject` that sets `showPreviewComparison` to false and resets beautified content states to empty strings
10. THE useBeautifyWorkflow hook SHALL expose `handleRetry` that resets `beautifyError` to null and sets `showBeautifyOptions` to true
11. THE useBeautifyWorkflow hook SHALL expose `handleDismiss` that resets all beautification states to initial values and closes all dialogs
12. THE useBeautifyWorkflow hook SHALL use the `useSSEStream` hook internally for stream processing
13. THE useBeautifyWorkflow hook SHALL update `beautifyStage` through stages: `analyzing`, `completing` (when mode is complete), `enhancing`, and `finalizing` based on received SSE events
14. WHEN beautification completes successfully with a `done` event containing `result.html` and `result.css`, THE useBeautifyWorkflow hook SHALL populate `beautifiedHtml` and `beautifiedCss` from the result and set `showPreviewComparison` to true
15. IF the streaming request fails or receives an `error` event, THEN THE useBeautifyWorkflow hook SHALL set `beautifyError` to the error message and set `isBeautifying` to false

### Requirement 7: Refactor Website Page to Use Extracted Components and Hooks

**User Story:** As a developer, I want the Website_Page refactored to use extracted components and hooks, so that the page file is under 400 lines and easier to maintain.

#### Acceptance Criteria

1. THE Website_Page SHALL import and use an extracted LoadingSpinner component from `src/components/common`, where the LoadingSpinner displays a spinning indicator with a minimum height of 400 pixels and a "Loading website..." message
2. THE Website_Page SHALL import and use an extracted WebsiteNotFound component from `src/components/common`, where the WebsiteNotFound displays an error icon, a "Website not found" heading, an explanatory message, and a "Back to Dashboard" navigation button
3. THE Website_Page SHALL import and use the sanitizeFilename utility from `src/utils/filename`, where the utility transforms a title string to lowercase, removes non-alphanumeric characters except spaces and hyphens, replaces spaces with hyphens, collapses consecutive hyphens, and truncates to a maximum of 50 characters
4. THE Website_Page SHALL import and use a useAutoSave hook that encapsulates debounced auto-save logic with a 2000 millisecond delay, unsaved changes tracking, save status state, and beforeunload warning behavior
5. THE Website_Page SHALL import and use a useBeautifyWorkflow hook that encapsulates beautification state management including streaming content handling, stage transitions, abort controller management, preview comparison state, and save options dialog state
6. WHEN refactoring is complete, THE Website_Page file SHALL contain fewer than 400 lines of code as measured by the total number of newline characters plus one
7. THE Website_Page SHALL maintain all existing functionality: iframe preview rendering with viewport mode switching, HTML and CSS code editing with live preview updates, download with single-file HTML and ZIP archive format options, showcase toggle with optimistic UI update, beautification workflow with streaming progress display and preview comparison, fullscreen preview mode, and unsaved changes warning on navigation

### Requirement 8: Refactor Generate Page to Use useSSEStream Hook

**User Story:** As a developer, I want the Generate_Page refactored to use the enhanced useSSEStream hook, so that SSE streaming logic is not duplicated.

#### Acceptance Criteria

1. THE Generate_Page SHALL remove SSE-specific code from the `generateFromText` function, where SSE-specific code means the stream reader loop, TextDecoder usage, createParser invocation, and event parsing logic
2. THE Generate_Page SHALL remove SSE-specific code from the `generateFromScreenshot` function, where SSE-specific code means the stream reader loop, TextDecoder usage, createParser invocation, and event parsing logic
3. THE Generate_Page SHALL use the enhanced useSSEStream_Hook for both text and screenshot generation
4. THE Generate_Page SHALL pass stage detection logic via `onTextChunk` callback to detect '\`\`\`css' and 'Title:' patterns
5. THE Generate_Page SHALL receive final results via `onResult` callback or `result` state from the useSSEStream hook
6. WHEN refactoring is complete, THE Generate_Page file SHALL contain fewer than 400 lines of code
7. IF an SSE stream error occurs, THEN THE Generate_Page SHALL display the error message and preserve the user's input for retry
8. THE Generate_Page SHALL maintain existing functionality: mode switching between text and screenshot, input validation before generation, cancel button that stops generation within 5 seconds, and navigation to the preview page after successful generation

### Requirement 9: Extract Login Page Components

**User Story:** As a developer, I want the Login_Page inline components extracted to separate files, so that the page is smaller and components can be reused or tested independently.

#### Acceptance Criteria

1. THE Component_Extraction SHALL create a `GoogleSignInButton` component file at `src/components/auth/GoogleSignInButton.tsx`
2. THE GoogleSignInButton component SHALL accept `onClick`, `isLoading`, and optional `disabled` props and render an accessible Google Sign-In button with loading state
3. THE Component_Extraction SHALL create a `ShowcasePreview` component file at `src/components/ShowcasePreview.tsx` containing the CommunityShowcase and ShowcaseCard components
4. THE ShowcasePreview component SHALL use the useShowcaseWebsites hook with pageSize of 6 to fetch and display showcased websites
5. THE Login_Page SHALL import and use the extracted LoadingSpinner component from `src/components/common` for the auth loading state
6. THE Login_Page SHALL import and use the extracted GoogleSignInButton component from `src/components/auth`
7. THE Login_Page SHALL import and use the extracted ShowcasePreview component for the Community Showcase section
8. WHEN refactoring is complete, THE Login_Page file SHALL contain fewer than 300 lines of code
9. THE Login_Page SHALL maintain all existing functionality: Google OAuth sign-in, error display with dismiss, redirect after authentication, and Community Showcase preview

### Requirement 10: Extract Dashboard Page Components

**User Story:** As a developer, I want the Dashboard_Page inline components extracted, so that duplicates are eliminated and the page is smaller.

#### Acceptance Criteria

1. THE Dashboard_Page SHALL import and use the extracted LoadingSpinner component from `src/components/common` instead of its inline LoadingSpinner
2. THE Component_Extraction SHALL move the ShowcaseLink component to `src/components/layout/ShowcaseLink.tsx`
3. THE ShowcaseLink component SHALL render a navigation link to `/showcase` with globe icon and responsive text display
4. THE Dashboard_Page SHALL import ShowcaseLink from `src/components/layout`
5. WHEN refactoring is complete, THE Dashboard_Page file SHALL contain fewer than 350 lines of code
6. THE Dashboard_Page SHALL maintain all existing functionality: website grid with WebsiteCard, pagination, delete confirmation dialog, empty state, and error state with retry

### Requirement 11: Extract Showcase Page Components

**User Story:** As a developer, I want the Showcase_Page inline components extracted to shared files, so that similar components across pages are unified.

#### Acceptance Criteria

1. THE Component_Extraction SHALL create a `ShowcaseWebsiteCard` component file at `src/components/ShowcaseWebsiteCard.tsx`
2. THE ShowcaseWebsiteCard component SHALL accept a `website` prop of type `ShowcasedWebsite` and render a card with thumbnail, title, and creator name with link to public view
3. THE Component_Extraction SHALL create a `WebsiteCardSkeleton` component file at `src/components/common/WebsiteCardSkeleton.tsx`
4. THE WebsiteCardSkeleton component SHALL render an animated skeleton placeholder matching the WebsiteCard dimensions
5. THE Showcase_Page SHALL import and use ShowcaseWebsiteCard instead of its inline WebsiteCard
6. THE Showcase_Page SHALL import and use WebsiteCardSkeleton from `src/components/common` instead of its inline skeleton
7. WHEN refactoring is complete, THE Showcase_Page file SHALL contain fewer than 200 lines of code
8. THE Showcase_Page SHALL maintain all existing functionality: website grid, pagination, empty state, error state with retry, and results count display

### Requirement 12: Maintain eventsource-parser Library Usage

**User Story:** As a developer, I want all SSE parsing to use the eventsource-parser library consistently, so that the recently fixed parser behavior is preserved and no manual line-based parsing exists.

#### Acceptance Criteria

1. THE useSSEStream_Hook SHALL import `createParser` from 'eventsource-parser' and create a parser instance with an `onEvent` callback to process SSE events
2. THE useSSEStream_Hook SHALL call `parser.feed(decodedChunk)` for each chunk received from the stream reader
3. WHEN the stream reader signals done (reader.read() returns done=true), THE useSSEStream_Hook SHALL call `parser.reset({ consume: true })` to flush any remaining buffered data before marking the stream as complete
4. THE useSSEStream_Hook SHALL receive parsed events via the eventsource-parser onEvent callback, where each event contains an `event` property (event type) and a `data` property (event payload string)
5. THE refactored code SHALL NOT contain any manual SSE parsing logic including: string splitting on newlines to parse SSE format, regular expressions to match 'event:' or 'data:' prefixes, manual buffer management for SSE line boundaries
6. THE refactored code SHALL NOT introduce alternative SSE parsing libraries other than eventsource-parser

### Requirement 13: Update Test Coverage for Rewritten Hook

**User Story:** As a developer, I want the test file updated to match the new eventsource-parser-based implementation, so that code quality is maintained.

#### Acceptance Criteria

1. THE test file `src/hooks/useSSEStream.test.ts` SHALL be updated to test the new eventsource-parser-based implementation
2. THE updated tests SHALL verify that `createParser` from 'eventsource-parser' is used for SSE parsing
3. THE updated tests SHALL verify that `parser.reset({ consume: true })` is called when the stream completes
4. THE updated tests SHALL maintain coverage for existing behaviors: configuration acceptance, start/cancel functionality, abort error handling, error handling, streaming content accumulation
5. THE updated tests SHALL add coverage for new functionality: `onTextChunk` callback, `onResult` callback, `result` state
6. THE refactoring SHALL NOT cause any existing tests in `src/hooks/useBeautifySave.test.ts` to fail
7. WHEN new hooks are created (useAutoSave, useBeautifyWorkflow), THE Hook_Extraction SHALL include a corresponding test file with at least one test case exercising the hook's primary functionality
