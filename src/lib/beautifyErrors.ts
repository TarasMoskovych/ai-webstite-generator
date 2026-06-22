/**
 * Beautify Error Messages
 *
 * This module provides error message mapping for beautification-related errors.
 * It maps error codes to user-friendly messages with categorization and
 * retry guidance where appropriate.
 *
 * @description Error message mapping for beautify feature including
 * validation, network, AI, and general error categories.
 *
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5
 */

/**
 * Error categories for beautification errors
 */
export type BeautifyErrorCategory = 'validation' | 'network' | 'ai' | 'general';

/**
 * Beautify-specific error codes
 */
export type BeautifyErrorCode =
  | 'BEAUTIFY_NETWORK_ERROR'
  | 'BEAUTIFY_TIMEOUT_ERROR'
  | 'BEAUTIFY_AUTH_ERROR'
  | 'BEAUTIFY_RATE_LIMIT_ERROR'
  | 'BEAUTIFY_PARSE_ERROR'
  | 'BEAUTIFY_VALIDATION_ERROR'
  | 'BEAUTIFY_MISSING_FIELDS'
  | 'BEAUTIFY_INVALID_IMAGE_TYPE'
  | 'BEAUTIFY_IMAGE_TOO_LARGE'
  | 'BEAUTIFY_AI_ERROR'
  | 'BEAUTIFY_CANCELLED'
  | 'BEAUTIFY_UNKNOWN_ERROR';

/**
 * Error codes as a const object for use in switch statements
 */
export const BEAUTIFY_ERROR_CODES = {
  NETWORK_ERROR: 'BEAUTIFY_NETWORK_ERROR',
  TIMEOUT_ERROR: 'BEAUTIFY_TIMEOUT_ERROR',
  AUTH_ERROR: 'BEAUTIFY_AUTH_ERROR',
  RATE_LIMIT_ERROR: 'BEAUTIFY_RATE_LIMIT_ERROR',
  PARSE_ERROR: 'BEAUTIFY_PARSE_ERROR',
  VALIDATION_ERROR: 'BEAUTIFY_VALIDATION_ERROR',
  MISSING_FIELDS: 'BEAUTIFY_MISSING_FIELDS',
  INVALID_IMAGE_TYPE: 'BEAUTIFY_INVALID_IMAGE_TYPE',
  IMAGE_TOO_LARGE: 'BEAUTIFY_IMAGE_TOO_LARGE',
  AI_ERROR: 'BEAUTIFY_AI_ERROR',
  CANCELLED: 'BEAUTIFY_CANCELLED',
  UNKNOWN_ERROR: 'BEAUTIFY_UNKNOWN_ERROR',
} as const;

/**
 * Beautify error interface with structured information
 */
export interface BeautifyError {
  /** Error code for programmatic handling */
  code: BeautifyErrorCode;
  /** Error category for UI display */
  category: BeautifyErrorCategory;
  /** User-friendly error message */
  message: string;
  /** Whether the error is recoverable via retry */
  isRetryable: boolean;
  /** Suggested action for the user */
  suggestedAction?: string;
  /** Additional technical details (not shown to users) */
  details?: string;
  /** Seconds to wait before retry (for rate limiting) */
  retryAfter?: number;
}

/**
 * User-friendly error messages for each beautify error code
 *
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5
 */
export const BEAUTIFY_ERROR_MESSAGES: Record<BeautifyErrorCode, string> = {
  BEAUTIFY_NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  BEAUTIFY_TIMEOUT_ERROR: 'Beautification timed out. The website may be too complex. Please try again.',
  BEAUTIFY_AUTH_ERROR: 'Session expired. Please refresh the page and try again.',
  BEAUTIFY_RATE_LIMIT_ERROR: 'Service is busy. Please wait a moment and try again.',
  BEAUTIFY_PARSE_ERROR: 'Failed to process beautified content. Please try again.',
  BEAUTIFY_VALIDATION_ERROR: 'Invalid input. Please check your data and try again.',
  BEAUTIFY_MISSING_FIELDS: 'Missing required fields. Please ensure all required data is provided.',
  BEAUTIFY_INVALID_IMAGE_TYPE: 'Invalid image format. Please upload a PNG, JPEG, or WebP image.',
  BEAUTIFY_IMAGE_TOO_LARGE: 'Image is too large. Please upload an image smaller than 10MB.',
  BEAUTIFY_AI_ERROR: 'AI processing failed. Please try again.',
  BEAUTIFY_CANCELLED: 'Beautification was cancelled.',
  BEAUTIFY_UNKNOWN_ERROR: 'Something went wrong. Please try again.',
};

/**
 * Error categories for each error code
 */
export const BEAUTIFY_ERROR_CATEGORIES: Record<BeautifyErrorCode, BeautifyErrorCategory> = {
  BEAUTIFY_NETWORK_ERROR: 'network',
  BEAUTIFY_TIMEOUT_ERROR: 'network',
  BEAUTIFY_AUTH_ERROR: 'general',
  BEAUTIFY_RATE_LIMIT_ERROR: 'ai',
  BEAUTIFY_PARSE_ERROR: 'ai',
  BEAUTIFY_VALIDATION_ERROR: 'validation',
  BEAUTIFY_MISSING_FIELDS: 'validation',
  BEAUTIFY_INVALID_IMAGE_TYPE: 'validation',
  BEAUTIFY_IMAGE_TOO_LARGE: 'validation',
  BEAUTIFY_AI_ERROR: 'ai',
  BEAUTIFY_CANCELLED: 'general',
  BEAUTIFY_UNKNOWN_ERROR: 'general',
};

/**
 * Whether each error code is retryable
 */
export const BEAUTIFY_ERROR_RETRYABLE: Record<BeautifyErrorCode, boolean> = {
  BEAUTIFY_NETWORK_ERROR: true,
  BEAUTIFY_TIMEOUT_ERROR: true,
  BEAUTIFY_AUTH_ERROR: false, // Requires page refresh
  BEAUTIFY_RATE_LIMIT_ERROR: true,
  BEAUTIFY_PARSE_ERROR: true,
  BEAUTIFY_VALIDATION_ERROR: false, // Requires input correction
  BEAUTIFY_MISSING_FIELDS: false, // Requires input correction
  BEAUTIFY_INVALID_IMAGE_TYPE: false, // Requires different image
  BEAUTIFY_IMAGE_TOO_LARGE: false, // Requires different image
  BEAUTIFY_AI_ERROR: true,
  BEAUTIFY_CANCELLED: false, // User initiated
  BEAUTIFY_UNKNOWN_ERROR: true,
};

/**
 * Suggested actions for each error code
 */
export const BEAUTIFY_ERROR_ACTIONS: Record<BeautifyErrorCode, string> = {
  BEAUTIFY_NETWORK_ERROR: 'Check your internet connection and try again.',
  BEAUTIFY_TIMEOUT_ERROR: 'Try simplifying your website or retry the operation.',
  BEAUTIFY_AUTH_ERROR: 'Refresh the page to restore your session.',
  BEAUTIFY_RATE_LIMIT_ERROR: 'Wait a few seconds before trying again.',
  BEAUTIFY_PARSE_ERROR: 'Retry the beautification process.',
  BEAUTIFY_VALIDATION_ERROR: 'Review and correct your input.',
  BEAUTIFY_MISSING_FIELDS: 'Ensure all required fields are filled.',
  BEAUTIFY_INVALID_IMAGE_TYPE: 'Upload a PNG, JPEG, or WebP image.',
  BEAUTIFY_IMAGE_TOO_LARGE: 'Resize your image to be under 10MB.',
  BEAUTIFY_AI_ERROR: 'Retry the beautification process.',
  BEAUTIFY_CANCELLED: 'Start the beautification again when ready.',
  BEAUTIFY_UNKNOWN_ERROR: 'Retry the operation or contact support.',
};

/**
 * Creates a BeautifyError from an error code and optional details
 *
 * @param code - The beautify error code
 * @param customMessage - Optional custom message to override the default
 * @param details - Optional technical details for debugging
 * @param retryAfter - Optional seconds to wait before retry
 * @returns BeautifyError with all relevant information
 *
 * @example
 * ```typescript
 * const error = createBeautifyError('BEAUTIFY_NETWORK_ERROR');
 * // { code: 'BEAUTIFY_NETWORK_ERROR', category: 'network', message: '...', ... }
 *
 * const customError = createBeautifyError(
 *   'BEAUTIFY_RATE_LIMIT_ERROR',
 *   undefined,
 *   'API quota exceeded',
 *   30
 * );
 * // Includes retryAfter: 30
 * ```
 */
export function createBeautifyError(
  code: BeautifyErrorCode,
  customMessage?: string,
  details?: string,
  retryAfter?: number
): BeautifyError {
  return {
    code,
    category: BEAUTIFY_ERROR_CATEGORIES[code],
    message: customMessage ?? BEAUTIFY_ERROR_MESSAGES[code],
    isRetryable: BEAUTIFY_ERROR_RETRYABLE[code],
    suggestedAction: BEAUTIFY_ERROR_ACTIONS[code],
    details,
    retryAfter,
  };
}

/**
 * Maps an error string or Error object to a BeautifyErrorCode
 *
 * @param error - The error to map (string or Error object)
 * @returns The corresponding BeautifyErrorCode
 *
 * @example
 * ```typescript
 * const code = mapErrorToBeautifyCode('network error');
 * // 'BEAUTIFY_NETWORK_ERROR'
 *
 * const code2 = mapErrorToBeautifyCode(new Error('timeout'));
 * // 'BEAUTIFY_TIMEOUT_ERROR'
 * ```
 */
export function mapErrorToBeautifyCode(error: string | Error): BeautifyErrorCode {
  const errorMessage = typeof error === 'string' ? error.toLowerCase() : error.message.toLowerCase();

  // Check for cancellation FIRST (more specific "aborted by user" before generic "aborted")
  if (
    errorMessage.includes('cancel') ||
    errorMessage.includes('aborted by user')
  ) {
    return 'BEAUTIFY_CANCELLED';
  }

  // Check for image-related errors BEFORE generic validation checks
  if (
    errorMessage.includes('image type') ||
    errorMessage.includes('mime') ||
    errorMessage.includes('image format')
  ) {
    return 'BEAUTIFY_INVALID_IMAGE_TYPE';
  }

  if (
    errorMessage.includes('too large') ||
    errorMessage.includes('file size') ||
    errorMessage.includes('exceeds')
  ) {
    return 'BEAUTIFY_IMAGE_TOO_LARGE';
  }

  // Check for network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('unable to connect') ||
    errorMessage.includes('connection')
  ) {
    return 'BEAUTIFY_NETWORK_ERROR';
  }

  // Check for timeout errors (after cancellation check)
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('timed out') ||
    errorMessage.includes('aborted')
  ) {
    return 'BEAUTIFY_TIMEOUT_ERROR';
  }

  // Check for authentication errors
  if (
    errorMessage.includes('auth') ||
    errorMessage.includes('session') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('401')
  ) {
    return 'BEAUTIFY_AUTH_ERROR';
  }

  // Check for rate limit errors
  if (
    errorMessage.includes('rate') ||
    errorMessage.includes('limit') ||
    errorMessage.includes('quota') ||
    errorMessage.includes('429') ||
    errorMessage.includes('busy')
  ) {
    return 'BEAUTIFY_RATE_LIMIT_ERROR';
  }

  // Check for parse errors
  if (
    errorMessage.includes('parse') ||
    errorMessage.includes('extract') ||
    errorMessage.includes('invalid response') ||
    errorMessage.includes('failed to process')
  ) {
    return 'BEAUTIFY_PARSE_ERROR';
  }

  // Check for AI errors
  if (
    errorMessage.includes('ai') ||
    errorMessage.includes('claude') ||
    errorMessage.includes('generation failed')
  ) {
    return 'BEAUTIFY_AI_ERROR';
  }

  // Check for validation errors (more generic, check after specific ones)
  if (
    errorMessage.includes('validation') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('missing')
  ) {
    return 'BEAUTIFY_VALIDATION_ERROR';
  }

  // Default to unknown error
  return 'BEAUTIFY_UNKNOWN_ERROR';
}

/**
 * Creates a BeautifyError from any error source
 *
 * This is a convenience function that combines error mapping and creation.
 *
 * @param error - The error to convert (string, Error, or BeautifyErrorCode)
 * @param details - Optional technical details
 * @returns BeautifyError with all relevant information
 *
 * @example
 * ```typescript
 * try {
 *   await beautifyWebsite();
 * } catch (err) {
 *   const beautifyError = getBeautifyError(err);
 *   showErrorToUser(beautifyError.message);
 *   if (beautifyError.isRetryable) {
 *     showRetryButton();
 *   }
 * }
 * ```
 */
export function getBeautifyError(
  error: string | Error | BeautifyErrorCode,
  details?: string
): BeautifyError {
  // If it's already a BeautifyErrorCode
  if (typeof error === 'string' && error.startsWith('BEAUTIFY_')) {
    return createBeautifyError(error as BeautifyErrorCode, undefined, details);
  }

  // Map the error to a code
  const code = mapErrorToBeautifyCode(error);

  // Include the original error message in details if it's an Error object
  const errorDetails = error instanceof Error
    ? details || error.message
    : details;

  return createBeautifyError(code, undefined, errorDetails);
}

/**
 * Gets user-friendly error message for a beautify error
 *
 * This is a simple helper for cases where only the message is needed.
 *
 * @param code - The beautify error code
 * @returns User-friendly error message
 *
 * @example
 * ```typescript
 * const message = getBeautifyErrorMessage('BEAUTIFY_TIMEOUT_ERROR');
 * // "Beautification timed out. The website may be too complex. Please try again."
 * ```
 */
export function getBeautifyErrorMessage(code: BeautifyErrorCode): string {
  return BEAUTIFY_ERROR_MESSAGES[code];
}

/**
 * Checks if an error code is retryable
 *
 * @param code - The beautify error code
 * @returns true if the error can be retried
 *
 * @example
 * ```typescript
 * if (isBeautifyErrorRetryable('BEAUTIFY_NETWORK_ERROR')) {
 *   showRetryButton();
 * }
 * ```
 */
export function isBeautifyErrorRetryable(code: BeautifyErrorCode): boolean {
  return BEAUTIFY_ERROR_RETRYABLE[code];
}

/**
 * Gets the category of a beautify error
 *
 * @param code - The beautify error code
 * @returns The error category
 *
 * @example
 * ```typescript
 * const category = getBeautifyErrorCategory('BEAUTIFY_NETWORK_ERROR');
 * // 'network'
 * ```
 */
export function getBeautifyErrorCategory(code: BeautifyErrorCode): BeautifyErrorCategory {
  return BEAUTIFY_ERROR_CATEGORIES[code];
}
