/**
 * Application Constants
 * Defines validation rules, timeouts, and dimension constants
 */

/**
 * Validation rules for user inputs
 */
export const VALIDATION = {
  TEXT_INPUT: {
    /** Minimum characters required for text input */
    MIN_LENGTH: 10,
    /** Maximum characters allowed for text input */
    MAX_LENGTH: 10_000,
  },
  SCREENSHOT_INPUT: {
    /** Maximum file size in bytes (10MB) */
    MAX_SIZE_BYTES: 10 * 1024 * 1024,
    /** Minimum image width in pixels */
    MIN_WIDTH: 200,
    /** Minimum image height in pixels */
    MIN_HEIGHT: 200,
    /** Maximum image dimension in pixels (Claude API limit is 8000px) */
    MAX_DIMENSION: 7680,
    /** Allowed MIME types for screenshots */
    ALLOWED_TYPES: ['image/png', 'image/jpeg', 'image/webp'] as const,
  },
  TITLE: {
    /** Minimum characters required for title */
    MIN_LENGTH: 1,
    /** Maximum characters allowed for title */
    MAX_LENGTH: 100,
  },
} as const;

/**
 * Timeout durations in milliseconds
 */
export const TIMEOUTS = {
  /**
   * Maximum time for website generation (5 minutes / 300 seconds)
   * This should be less than or equal to the Anthropic SDK timeout in src/lib/claude.ts
   * Note: Vercel Hobby plan has 120s max, Pro has 300s. Adjust based on your plan.
   */
  GENERATION: 300_000,
  /** Maximum time for file download generation (5 seconds) */
  DOWNLOAD: 5_000,
  /** Maximum time for cancel operation (5 seconds) */
  CANCEL: 5_000,
  /** Debounce time for preview updates after code changes (1 second) */
  PREVIEW_UPDATE: 1_000,
} as const;

/**
 * Pagination settings
 */
export const PAGINATION = {
  /** Number of websites to display per page */
  PAGE_SIZE: 12,
} as const;

/**
 * Viewport dimensions for responsive preview modes
 */
export const VIEWPORT_DIMENSIONS = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
} as const;

/**
 * Viewport mode type derived from dimensions object
 */
export type ViewportMode = keyof typeof VIEWPORT_DIMENSIONS;

/**
 * Thumbnail dimensions for website cards
 */
export const THUMBNAIL_DIMENSIONS = {
  width: 320,
  height: 240,
} as const;

/**
 * Generation stage display messages
 */
export const GENERATION_STAGE_MESSAGES = {
  processing_input: 'Processing input...',
  generating_html: 'Generating HTML...',
  generating_css: 'Generating CSS...',
  finalizing: 'Finalizing...',
  completed: 'Done!',
} as const;

/**
 * Maximum retry attempts for failed operations
 */
export const MAX_RETRY_ATTEMPTS = 3;
