# Requirements Document

## Introduction

This document specifies the requirements for the App Footer Copyright component feature. The footer will display copyright information, social links to the developer's GitHub repository and LinkedIn profile, and call-to-action text encouraging user engagement. The footer must be visible throughout the application UI but hidden when viewing generated websites in full preview mode to maintain a clean, standalone presentation.

## Glossary

- **App_Footer**: A React component that displays copyright notice, social links, and engagement text at the bottom of the application pages.
- **Full_Preview_Mode**: The /view/[id] route that renders user-generated websites as standalone full-page sites without any application UI elements.
- **Main_App_Layout**: The root layout at src/app/layout.tsx that wraps all application pages with common UI elements and providers.
- **View_Layout**: The special layout at src/app/view/layout.tsx that intentionally strips all application UI for rendering generated websites.
- **GitHub_Link**: A hyperlink pointing to the developer's GitHub repository (https://github.com/TarasMoskovych/ai-webstite-generator).
- **LinkedIn_Link**: A hyperlink pointing to the developer's LinkedIn profile (https://www.linkedin.com/in/taras-moskovych/).
- **Theme_Context**: The application's theme system that provides light/dark mode styling.

## Requirements

### Requirement 1: Footer Component Structure

**User Story:** As a user, I want to see a well-organized footer with copyright and social information, so that I know who created the application and how to connect with them.

#### Acceptance Criteria

1. THE App_Footer SHALL display a copyright notice containing the current year and the developer's name
2. THE App_Footer SHALL display a GitHub_Link that opens the repository in a new browser tab
3. THE App_Footer SHALL display a LinkedIn_Link that opens the profile in a new browser tab
4. THE App_Footer SHALL display text encouraging users to star the project on GitHub
5. THE App_Footer SHALL display text encouraging users to follow or connect on LinkedIn

### Requirement 2: Footer Visibility Control

**User Story:** As a user viewing a generated website in full preview mode, I want the page to display without any application UI elements, so that I see the generated website as a standalone page.

#### Acceptance Criteria

1. WHILE the user is viewing any page under the Main_App_Layout (and NOT in Full_Preview_Mode), THE App_Footer SHALL be visible at the bottom of the page
2. WHILE the user is viewing a generated website in Full_Preview_Mode, THE App_Footer SHALL NOT be rendered (Full_Preview_Mode takes priority)
3. THE View_Layout and Main_App_Layout SHALL be mutually exclusive contexts - users cannot be in both simultaneously
4. THE View_Layout SHALL continue to exclude all application UI elements including the App_Footer

### Requirement 3: Theme Integration

**User Story:** As a user, I want the footer to match the current application theme, so that the design is consistent with the rest of the interface.

#### Acceptance Criteria

1. THE App_Footer SHALL adapt its colors and styling based on the current theme from Theme_Context
2. WHEN the theme changes from light to dark or vice versa, THE App_Footer SHALL update its appearance immediately during the transition (not waiting for the change to complete)
3. THE App_Footer SHALL use the application's existing design system CSS variables for consistent styling

### Requirement 4: Link Accessibility and Security

**User Story:** As a user, I want the footer links to be accessible and secure, so that I can safely navigate to external sites.

#### Acceptance Criteria

1. THE GitHub_Link SHALL include rel="noopener noreferrer" attribute for security
2. THE LinkedIn_Link SHALL include rel="noopener noreferrer" attribute for security
3. THE GitHub_Link SHALL include an accessible aria-label describing the link destination
4. THE LinkedIn_Link SHALL include an accessible aria-label describing the link destination
5. THE App_Footer SHALL use semantic HTML elements with appropriate ARIA roles for accessibility

### Requirement 5: Responsive Design

**User Story:** As a user on different devices, I want the footer to display properly on all screen sizes, so that I can read and interact with it regardless of my device.

#### Acceptance Criteria

1. THE App_Footer SHALL be fully visible and readable on mobile devices with screen widths of 320px or greater
2. THE App_Footer SHALL adjust its layout appropriately for different screen sizes
3. THE App_Footer links SHALL have touch-friendly target sizes of at least 44x44 pixels on touch devices

### Requirement 6: Layout Integration

**User Story:** As a developer, I want the footer component to integrate cleanly with the existing layout structure, so that the codebase remains organized and maintainable.

#### Acceptance Criteria

1. THE App_Footer component SHALL be created in the src/components/layout directory following existing component patterns
2. THE App_Footer SHALL be exported from the layout components barrel export (src/components/layout/index.ts)
3. THE Main_App_Layout SHALL include the App_Footer component after the main content area
4. THE App_Footer SHALL position itself at the bottom of the page content, not fixed to the viewport
