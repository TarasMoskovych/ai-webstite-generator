# Requirements Document

## Introduction

This specification defines the requirements for refactoring duplicated code patterns found across components and pages into reusable custom hooks and shared components. The goal is to improve code maintainability, reduce bundle size, and establish consistent patterns throughout the codebase. The refactoring focuses on six identified duplication areas: website fetching patterns, icon components, showcase website fetching, pagination component duplication, SSE stream processing, and Firebase ID token retrieval.

## Glossary

- **Custom_Hook**: A reusable React hook that encapsulates stateful logic and can be shared across multiple components
- **useWebsites_Hook**: A custom hook that manages website fetching, loading state, error handling, and pagination for user-owned websites
- **useShowcaseWebsites_Hook**: A custom hook that manages showcase website fetching, loading state, error handling, and pagination
- **useSSEStream_Hook**: A custom hook that handles Server-Sent Events stream processing with abort capability
- **useFirebaseAuth_Hook**: A custom hook that provides Firebase authentication utilities including ID token retrieval
- **Icon_Component**: A reusable SVG icon component that accepts className and aria-hidden props
- **Icons_Module**: A centralized module exporting all shared icon components
- **Pagination_Component**: The existing reusable pagination component in `src/components/Pagination.tsx`
- **Website_Repository**: The existing service at `src/services/websiteRepository` for website CRUD operations

## Requirements

### Requirement 1: Shared Icon Components Module

**User Story:** As a developer, I want all icon components to be defined in a single shared location, so that I can avoid duplicating SVG code across multiple files and maintain consistent icon styling.

#### Acceptance Criteria

1. THE Icons_Module SHALL export the following Icon_Components: GlobeIcon, ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon, XIcon, TrashIcon, EditIcon, TextIcon, ImageIcon, SparklesIcon, DownloadIcon, CodeIcon, PanelLeftIcon, PanelRightIcon, MaximizeIcon, MinimizeIcon, PlusIcon
2. WHEN an Icon_Component is rendered, THE Icon_Component SHALL accept an optional className prop for styling customization
3. WHEN an Icon_Component is rendered, THE Icon_Component SHALL include aria-hidden="true" attribute for accessibility
4. THE Icons_Module SHALL be located at `src/components/icons/index.ts`
5. FOR ALL files importing duplicated icon components, THE Refactoring SHALL replace inline icon definitions with imports from Icons_Module

### Requirement 2: useWebsites Custom Hook

**User Story:** As a developer, I want a reusable hook for fetching user-owned websites with pagination, so that I can avoid duplicating the same fetching logic across dashboard and other pages.

#### Acceptance Criteria

1. THE useWebsites_Hook SHALL accept a userId parameter and an optional pageSize parameter with default value of 12
2. WHEN the useWebsites_Hook is initialized, THE useWebsites_Hook SHALL fetch the first page of websites belonging to the specified user
3. THE useWebsites_Hook SHALL return an object containing: items (website array), isLoading (boolean), error (string or null), currentPage (number), totalPages (number), fetchPage (function), and refresh (function)
4. WHEN fetchPage is called with a page number, THE useWebsites_Hook SHALL fetch websites for that page and update the state
5. IF an error occurs during fetching and no automatic retry is in progress, THEN THE useWebsites_Hook SHALL set the error state with a descriptive message and set isLoading to false; IF automatic retry is in progress, THEN THE useWebsites_Hook SHALL keep isLoading as true until the retry completes or permanently fails
6. WHEN refresh is called, THE useWebsites_Hook SHALL refetch the current page
7. THE useWebsites_Hook SHALL be located at `src/hooks/useWebsites.ts`

### Requirement 3: useShowcaseWebsites Custom Hook

**User Story:** As a developer, I want a reusable hook for fetching showcased websites with pagination, so that I can share fetching logic between the home page showcase preview and the full showcase page.

#### Acceptance Criteria

1. THE useShowcaseWebsites_Hook SHALL accept an optional pageSize parameter with default value of 12
2. WHEN the useShowcaseWebsites_Hook is initialized, THE useShowcaseWebsites_Hook SHALL fetch the first page of showcased websites
3. THE useShowcaseWebsites_Hook SHALL return an object containing: items (website array), isLoading (boolean), error (string or null), currentPage (number), totalPages (number), totalCount (number), fetchPage (function), and refresh (function)
4. WHEN fetchPage is called with a page number, THE useShowcaseWebsites_Hook SHALL fetch showcased websites for that page and update the state
5. IF an error occurs during fetching and no automatic retry is in progress, THEN THE useShowcaseWebsites_Hook SHALL set the error state with a descriptive message and set isLoading to false; IF automatic retry is in progress, THEN THE useShowcaseWebsites_Hook SHALL keep isLoading as true until the retry completes or permanently fails
6. THE useShowcaseWebsites_Hook SHALL be located at `src/hooks/useShowcaseWebsites.ts`

### Requirement 4: useSSEStream Custom Hook

**User Story:** As a developer, I want a reusable hook for processing Server-Sent Events streams, so that I can avoid duplicating SSE parsing logic across generate and beautify features.

#### Acceptance Criteria

1. THE useSSEStream_Hook SHALL accept a configuration object containing: url (string), method (string), headers (object), body (object or null), and onEvent (callback function)
2. THE useSSEStream_Hook SHALL return an object containing: isStreaming (boolean), error (string or null), streamingContent (string), start (function), and cancel (function)
3. WHEN start is called, THE useSSEStream_Hook SHALL initiate a fetch request with the provided configuration and begin processing the SSE stream
4. WHEN an SSE event is received, THE useSSEStream_Hook SHALL parse the event type and data, then invoke the onEvent callback with the parsed event
5. WHEN cancel is called, THE useSSEStream_Hook SHALL abort the ongoing fetch request and mark streaming as stopped immediately, regardless of whether the underlying fetch abort completes
6. IF an error occurs during streaming, THEN THE useSSEStream_Hook SHALL set the error state and stop streaming
7. IF the request is aborted, THEN THE useSSEStream_Hook SHALL reset the streaming state without setting an error
8. THE useSSEStream_Hook SHALL be located at `src/hooks/useSSEStream.ts`

### Requirement 5: useFirebaseAuth Custom Hook Enhancement

**User Story:** As a developer, I want Firebase authentication utilities including ID token retrieval in a reusable hook, so that I can avoid duplicating the getIdToken function across multiple files.

#### Acceptance Criteria

1. THE useFirebaseAuth_Hook SHALL export a getIdToken function that returns a Promise resolving to the current user's Firebase ID token
2. IF no user is authenticated when getIdToken is called, THEN THE getIdToken function SHALL throw an Error with message "User not authenticated"
3. THE useFirebaseAuth_Hook SHALL be integrated into the existing useAuth hook at `src/components/auth/AuthContext.tsx` or exported from `src/hooks/useFirebaseAuth.ts`
4. FOR ALL files containing duplicate getIdToken implementations, THE Refactoring SHALL replace them with imports from useFirebaseAuth_Hook

### Requirement 6: Remove Pagination Duplication from Showcase Page

**User Story:** As a developer, I want the showcase page to use the shared Pagination component, so that pagination UI remains consistent and maintainable.

#### Acceptance Criteria

1. THE Showcase page SHALL import and use the Pagination_Component from `src/components/Pagination.tsx`
2. THE Showcase page SHALL remove the inline Pagination component definition
3. THE Showcase page SHALL remove the inline ChevronLeftIcon and ChevronRightIcon definitions and use Icons_Module imports instead
4. WHEN pagination is rendered on the showcase page, THE Pagination_Component SHALL receive currentPage, totalPages, and onPageChange props

### Requirement 7: Refactor Dashboard Page to Use Custom Hooks

**User Story:** As a developer, I want the dashboard page to use the new custom hooks, so that the page has cleaner, more maintainable code.

#### Acceptance Criteria

1. THE Dashboard page SHALL import and use useWebsites_Hook for fetching user websites
2. THE Dashboard page SHALL import icons from Icons_Module instead of defining them inline
3. THE Dashboard page SHALL maintain all existing functionality including pagination, deletion, title editing, and beautify navigation
4. WHEN the dashboard page renders, THE Dashboard page SHALL render successfully and display the same UI and behavior as before the refactoring

### Requirement 8: Refactor Showcase Page to Use Custom Hooks

**User Story:** As a developer, I want the showcase page to use the new custom hooks, so that the page has cleaner, more maintainable code.

#### Acceptance Criteria

1. THE Showcase page SHALL import and use useShowcaseWebsites_Hook for fetching showcased websites
2. THE Showcase page SHALL import icons from Icons_Module instead of defining them inline
3. THE Showcase page SHALL import and use Pagination_Component from the shared components
4. WHEN the showcase page renders, THE Showcase page SHALL display the same UI and behavior as before the refactoring

### Requirement 9: Refactor Home Page Community Showcase to Use Custom Hook

**User Story:** As a developer, I want the home page community showcase section to use the shared showcase fetching hook, so that fetching logic is not duplicated.

#### Acceptance Criteria

1. THE CommunityShowcase component on the home page SHALL import and use useShowcaseWebsites_Hook with pageSize of 6
2. THE CommunityShowcase component SHALL import icons from Icons_Module instead of defining them inline
3. WHEN the community showcase renders, THE CommunityShowcase component SHALL display the same UI and behavior as before the refactoring

### Requirement 10: Refactor Generate Page to Use Custom Hooks

**User Story:** As a developer, I want the generate page to use the new custom hooks for SSE streaming and authentication, so that the page has cleaner code.

#### Acceptance Criteria

1. THE Generate page SHALL import and use getIdToken from useFirebaseAuth_Hook instead of defining it inline
2. THE Generate page SHALL use useSSEStream_Hook for processing generation streams, or maintain current implementation if hook integration adds excessive complexity as determined by developer judgment; THE refactoring SHALL only proceed if all existing functionality including streaming preview and cancellation can be preserved
3. WHEN the generate page performs website generation, THE Generate page SHALL maintain all existing functionality including streaming preview and cancellation

### Requirement 11: Refactor Website Preview Page to Use Custom Hooks

**User Story:** As a developer, I want the website preview page to use the new custom hooks, so that the page has cleaner, more maintainable code.

#### Acceptance Criteria

1. THE Website preview page SHALL import and use getIdToken from useFirebaseAuth_Hook instead of defining it inline
2. THE Website preview page SHALL import icons from Icons_Module instead of defining them inline
3. THE Website preview page SHALL use useSSEStream_Hook for processing beautify streams, or maintain current implementation if hook integration adds excessive complexity as determined by developer judgment
4. WHEN the website preview page renders, THE Website preview page SHALL render successfully and display the same UI and behavior as before the refactoring

### Requirement 12: Refactor WebsiteCard Component to Use Shared Icons

**User Story:** As a developer, I want the WebsiteCard component to use shared icons, so that icon definitions are not duplicated.

#### Acceptance Criteria

1. THE WebsiteCard component SHALL import icons from Icons_Module instead of defining them inline
2. THE WebsiteCard component SHALL import GlobeIcon, TextIcon, ImageIcon, EditIcon, CheckIcon, XIcon, TrashIcon, and SparklesIcon strictly from Icons_Module and SHALL NOT import these icons from any other source
3. WHEN the WebsiteCard component renders, THE WebsiteCard component SHALL display the same UI and behavior as before the refactoring

### Requirement 13: Preserve Existing Test Coverage

**User Story:** As a developer, I want all existing tests to continue passing after refactoring, so that I have confidence the refactoring does not break functionality.

#### Acceptance Criteria

1. FOR ALL existing test files, THE Refactoring SHALL ensure tests continue to pass
2. THE Refactoring SHALL add unit tests for new custom hooks: useWebsites, useShowcaseWebsites, useSSEStream, and useFirebaseAuth
3. WHEN hook tests are executed, THE tests SHALL verify the hook returns correct initial state, handles loading states, handles errors, and exposes the expected API
