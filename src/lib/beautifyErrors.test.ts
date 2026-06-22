/**
 * Tests for Beautify Error Message Mapping
 *
 * This test suite validates the error message mapping functionality
 * for beautification-related errors, ensuring proper categorization,
 * user-friendly messages, and retry guidance.
 *
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5
 */

import { describe, it, expect } from 'vitest';
import {
  BEAUTIFY_ERROR_CODES,
  BEAUTIFY_ERROR_MESSAGES,
  BEAUTIFY_ERROR_CATEGORIES,
  BEAUTIFY_ERROR_RETRYABLE,
  BEAUTIFY_ERROR_ACTIONS,
  createBeautifyError,
  mapErrorToBeautifyCode,
  getBeautifyError,
  getBeautifyErrorMessage,
  isBeautifyErrorRetryable,
  getBeautifyErrorCategory,
  type BeautifyErrorCode,
} from './beautifyErrors';

describe('beautifyErrors', () => {
  describe('BEAUTIFY_ERROR_CODES', () => {
    it('should define all expected error codes', () => {
      expect(BEAUTIFY_ERROR_CODES.NETWORK_ERROR).toBe('BEAUTIFY_NETWORK_ERROR');
      expect(BEAUTIFY_ERROR_CODES.TIMEOUT_ERROR).toBe('BEAUTIFY_TIMEOUT_ERROR');
      expect(BEAUTIFY_ERROR_CODES.AUTH_ERROR).toBe('BEAUTIFY_AUTH_ERROR');
      expect(BEAUTIFY_ERROR_CODES.RATE_LIMIT_ERROR).toBe('BEAUTIFY_RATE_LIMIT_ERROR');
      expect(BEAUTIFY_ERROR_CODES.PARSE_ERROR).toBe('BEAUTIFY_PARSE_ERROR');
      expect(BEAUTIFY_ERROR_CODES.VALIDATION_ERROR).toBe('BEAUTIFY_VALIDATION_ERROR');
      expect(BEAUTIFY_ERROR_CODES.MISSING_FIELDS).toBe('BEAUTIFY_MISSING_FIELDS');
      expect(BEAUTIFY_ERROR_CODES.INVALID_IMAGE_TYPE).toBe('BEAUTIFY_INVALID_IMAGE_TYPE');
      expect(BEAUTIFY_ERROR_CODES.IMAGE_TOO_LARGE).toBe('BEAUTIFY_IMAGE_TOO_LARGE');
      expect(BEAUTIFY_ERROR_CODES.AI_ERROR).toBe('BEAUTIFY_AI_ERROR');
      expect(BEAUTIFY_ERROR_CODES.CANCELLED).toBe('BEAUTIFY_CANCELLED');
      expect(BEAUTIFY_ERROR_CODES.UNKNOWN_ERROR).toBe('BEAUTIFY_UNKNOWN_ERROR');
    });
  });

  describe('BEAUTIFY_ERROR_MESSAGES', () => {
    /**
     * Validates: Requirement 10.1
     * IF the Beautify_API returns a network error, THEN THE Website_Preview_Page
     * SHALL display "Unable to connect. Please check your internet connection."
     */
    it('should return correct message for network error', () => {
      expect(BEAUTIFY_ERROR_MESSAGES.BEAUTIFY_NETWORK_ERROR).toBe(
        'Unable to connect. Please check your internet connection.'
      );
    });

    /**
     * Validates: Requirement 10.2
     * IF the Beautify_API returns a timeout error, THEN THE Website_Preview_Page
     * SHALL display "Beautification timed out. The website may be too complex. Please try again."
     */
    it('should return correct message for timeout error', () => {
      expect(BEAUTIFY_ERROR_MESSAGES.BEAUTIFY_TIMEOUT_ERROR).toBe(
        'Beautification timed out. The website may be too complex. Please try again.'
      );
    });

    /**
     * Validates: Requirement 10.3
     * IF the Beautify_API returns an authentication error, THEN THE Website_Preview_Page
     * SHALL display "Session expired. Please refresh the page and try again."
     */
    it('should return correct message for authentication error', () => {
      expect(BEAUTIFY_ERROR_MESSAGES.BEAUTIFY_AUTH_ERROR).toBe(
        'Session expired. Please refresh the page and try again.'
      );
    });

    /**
     * Validates: Requirement 10.4
     * IF the Claude API returns a rate limit error, THEN THE Website_Preview_Page
     * SHALL display "Service is busy. Please wait a moment and try again."
     */
    it('should return correct message for rate limit error', () => {
      expect(BEAUTIFY_ERROR_MESSAGES.BEAUTIFY_RATE_LIMIT_ERROR).toBe(
        'Service is busy. Please wait a moment and try again.'
      );
    });

    /**
     * Validates: Requirement 10.5
     * IF the beautification result fails to parse, THEN THE Website_Preview_Page
     * SHALL display "Failed to process beautified content. Please try again."
     */
    it('should return correct message for parse error', () => {
      expect(BEAUTIFY_ERROR_MESSAGES.BEAUTIFY_PARSE_ERROR).toBe(
        'Failed to process beautified content. Please try again.'
      );
    });

    it('should have messages for all error codes', () => {
      const errorCodes = Object.values(BEAUTIFY_ERROR_CODES);
      for (const code of errorCodes) {
        expect(BEAUTIFY_ERROR_MESSAGES[code as BeautifyErrorCode]).toBeDefined();
        expect(typeof BEAUTIFY_ERROR_MESSAGES[code as BeautifyErrorCode]).toBe('string');
      }
    });
  });

  describe('BEAUTIFY_ERROR_CATEGORIES', () => {
    it('should categorize network errors as network', () => {
      expect(BEAUTIFY_ERROR_CATEGORIES.BEAUTIFY_NETWORK_ERROR).toBe('network');
      expect(BEAUTIFY_ERROR_CATEGORIES.BEAUTIFY_TIMEOUT_ERROR).toBe('network');
    });

    it('should categorize validation errors as validation', () => {
      expect(BEAUTIFY_ERROR_CATEGORIES.BEAUTIFY_VALIDATION_ERROR).toBe('validation');
      expect(BEAUTIFY_ERROR_CATEGORIES.BEAUTIFY_MISSING_FIELDS).toBe('validation');
      expect(BEAUTIFY_ERROR_CATEGORIES.BEAUTIFY_INVALID_IMAGE_TYPE).toBe('validation');
      expect(BEAUTIFY_ERROR_CATEGORIES.BEAUTIFY_IMAGE_TOO_LARGE).toBe('validation');
    });

    it('should categorize AI errors as ai', () => {
      expect(BEAUTIFY_ERROR_CATEGORIES.BEAUTIFY_RATE_LIMIT_ERROR).toBe('ai');
      expect(BEAUTIFY_ERROR_CATEGORIES.BEAUTIFY_PARSE_ERROR).toBe('ai');
      expect(BEAUTIFY_ERROR_CATEGORIES.BEAUTIFY_AI_ERROR).toBe('ai');
    });

    it('should categorize general errors as general', () => {
      expect(BEAUTIFY_ERROR_CATEGORIES.BEAUTIFY_AUTH_ERROR).toBe('general');
      expect(BEAUTIFY_ERROR_CATEGORIES.BEAUTIFY_CANCELLED).toBe('general');
      expect(BEAUTIFY_ERROR_CATEGORIES.BEAUTIFY_UNKNOWN_ERROR).toBe('general');
    });
  });

  describe('BEAUTIFY_ERROR_RETRYABLE', () => {
    it('should mark network and timeout errors as retryable', () => {
      expect(BEAUTIFY_ERROR_RETRYABLE.BEAUTIFY_NETWORK_ERROR).toBe(true);
      expect(BEAUTIFY_ERROR_RETRYABLE.BEAUTIFY_TIMEOUT_ERROR).toBe(true);
    });

    it('should mark rate limit and parse errors as retryable', () => {
      expect(BEAUTIFY_ERROR_RETRYABLE.BEAUTIFY_RATE_LIMIT_ERROR).toBe(true);
      expect(BEAUTIFY_ERROR_RETRYABLE.BEAUTIFY_PARSE_ERROR).toBe(true);
    });

    it('should mark auth errors as not retryable (requires refresh)', () => {
      expect(BEAUTIFY_ERROR_RETRYABLE.BEAUTIFY_AUTH_ERROR).toBe(false);
    });

    it('should mark validation errors as not retryable (requires input correction)', () => {
      expect(BEAUTIFY_ERROR_RETRYABLE.BEAUTIFY_VALIDATION_ERROR).toBe(false);
      expect(BEAUTIFY_ERROR_RETRYABLE.BEAUTIFY_MISSING_FIELDS).toBe(false);
      expect(BEAUTIFY_ERROR_RETRYABLE.BEAUTIFY_INVALID_IMAGE_TYPE).toBe(false);
      expect(BEAUTIFY_ERROR_RETRYABLE.BEAUTIFY_IMAGE_TOO_LARGE).toBe(false);
    });

    it('should mark cancelled as not retryable (user initiated)', () => {
      expect(BEAUTIFY_ERROR_RETRYABLE.BEAUTIFY_CANCELLED).toBe(false);
    });
  });

  describe('BEAUTIFY_ERROR_ACTIONS', () => {
    it('should provide suggested actions for all error codes', () => {
      const errorCodes = Object.values(BEAUTIFY_ERROR_CODES);
      for (const code of errorCodes) {
        expect(BEAUTIFY_ERROR_ACTIONS[code as BeautifyErrorCode]).toBeDefined();
        expect(typeof BEAUTIFY_ERROR_ACTIONS[code as BeautifyErrorCode]).toBe('string');
        expect(BEAUTIFY_ERROR_ACTIONS[code as BeautifyErrorCode].length).toBeGreaterThan(0);
      }
    });
  });

  describe('createBeautifyError', () => {
    it('should create error with default message', () => {
      const error = createBeautifyError('BEAUTIFY_NETWORK_ERROR');

      expect(error.code).toBe('BEAUTIFY_NETWORK_ERROR');
      expect(error.category).toBe('network');
      expect(error.message).toBe('Unable to connect. Please check your internet connection.');
      expect(error.isRetryable).toBe(true);
      expect(error.suggestedAction).toBe('Check your internet connection and try again.');
    });

    it('should create error with custom message', () => {
      const error = createBeautifyError('BEAUTIFY_NETWORK_ERROR', 'Custom network error');

      expect(error.message).toBe('Custom network error');
    });

    it('should include details when provided', () => {
      const error = createBeautifyError('BEAUTIFY_AI_ERROR', undefined, 'Claude API returned 500');

      expect(error.details).toBe('Claude API returned 500');
    });

    it('should include retryAfter when provided', () => {
      const error = createBeautifyError('BEAUTIFY_RATE_LIMIT_ERROR', undefined, undefined, 30);

      expect(error.retryAfter).toBe(30);
    });
  });

  describe('mapErrorToBeautifyCode', () => {
    it('should map network-related errors', () => {
      expect(mapErrorToBeautifyCode('network error')).toBe('BEAUTIFY_NETWORK_ERROR');
      expect(mapErrorToBeautifyCode('fetch failed')).toBe('BEAUTIFY_NETWORK_ERROR');
      expect(mapErrorToBeautifyCode('unable to connect')).toBe('BEAUTIFY_NETWORK_ERROR');
      expect(mapErrorToBeautifyCode(new Error('Connection refused'))).toBe('BEAUTIFY_NETWORK_ERROR');
    });

    it('should map timeout-related errors', () => {
      expect(mapErrorToBeautifyCode('timeout error')).toBe('BEAUTIFY_TIMEOUT_ERROR');
      expect(mapErrorToBeautifyCode('request timed out')).toBe('BEAUTIFY_TIMEOUT_ERROR');
      expect(mapErrorToBeautifyCode(new Error('Operation aborted'))).toBe('BEAUTIFY_TIMEOUT_ERROR');
    });

    it('should map authentication-related errors', () => {
      expect(mapErrorToBeautifyCode('auth failed')).toBe('BEAUTIFY_AUTH_ERROR');
      expect(mapErrorToBeautifyCode('session expired')).toBe('BEAUTIFY_AUTH_ERROR');
      expect(mapErrorToBeautifyCode('unauthorized')).toBe('BEAUTIFY_AUTH_ERROR');
      expect(mapErrorToBeautifyCode(new Error('401 Unauthorized'))).toBe('BEAUTIFY_AUTH_ERROR');
    });

    it('should map rate limit errors', () => {
      expect(mapErrorToBeautifyCode('rate limit exceeded')).toBe('BEAUTIFY_RATE_LIMIT_ERROR');
      expect(mapErrorToBeautifyCode('quota exceeded')).toBe('BEAUTIFY_RATE_LIMIT_ERROR');
      expect(mapErrorToBeautifyCode(new Error('429 Too Many Requests'))).toBe('BEAUTIFY_RATE_LIMIT_ERROR');
      expect(mapErrorToBeautifyCode('service is busy')).toBe('BEAUTIFY_RATE_LIMIT_ERROR');
    });

    it('should map parse errors', () => {
      expect(mapErrorToBeautifyCode('parse error')).toBe('BEAUTIFY_PARSE_ERROR');
      expect(mapErrorToBeautifyCode('failed to extract code')).toBe('BEAUTIFY_PARSE_ERROR');
      expect(mapErrorToBeautifyCode(new Error('Invalid response format'))).toBe('BEAUTIFY_PARSE_ERROR');
      expect(mapErrorToBeautifyCode('failed to process')).toBe('BEAUTIFY_PARSE_ERROR');
    });

    it('should map validation errors', () => {
      expect(mapErrorToBeautifyCode('validation error')).toBe('BEAUTIFY_VALIDATION_ERROR');
      expect(mapErrorToBeautifyCode('invalid input')).toBe('BEAUTIFY_VALIDATION_ERROR');
      expect(mapErrorToBeautifyCode('missing fields')).toBe('BEAUTIFY_VALIDATION_ERROR');
    });

    it('should map image-related errors', () => {
      expect(mapErrorToBeautifyCode('invalid image type')).toBe('BEAUTIFY_INVALID_IMAGE_TYPE');
      expect(mapErrorToBeautifyCode('unsupported mime type')).toBe('BEAUTIFY_INVALID_IMAGE_TYPE');
      expect(mapErrorToBeautifyCode('image too large')).toBe('BEAUTIFY_IMAGE_TOO_LARGE');
      expect(mapErrorToBeautifyCode('file size exceeds limit')).toBe('BEAUTIFY_IMAGE_TOO_LARGE');
    });

    it('should map cancellation errors', () => {
      expect(mapErrorToBeautifyCode('operation cancelled')).toBe('BEAUTIFY_CANCELLED');
      expect(mapErrorToBeautifyCode('aborted by user')).toBe('BEAUTIFY_CANCELLED');
    });

    it('should map AI errors', () => {
      expect(mapErrorToBeautifyCode('AI processing failed')).toBe('BEAUTIFY_AI_ERROR');
      expect(mapErrorToBeautifyCode('Claude API error')).toBe('BEAUTIFY_AI_ERROR');
      expect(mapErrorToBeautifyCode('generation failed')).toBe('BEAUTIFY_AI_ERROR');
    });

    it('should return unknown error for unrecognized messages', () => {
      expect(mapErrorToBeautifyCode('something weird happened')).toBe('BEAUTIFY_UNKNOWN_ERROR');
      expect(mapErrorToBeautifyCode(new Error('Unexpected error'))).toBe('BEAUTIFY_UNKNOWN_ERROR');
    });
  });

  describe('getBeautifyError', () => {
    it('should handle BeautifyErrorCode directly', () => {
      const error = getBeautifyError('BEAUTIFY_NETWORK_ERROR');

      expect(error.code).toBe('BEAUTIFY_NETWORK_ERROR');
      expect(error.message).toBe('Unable to connect. Please check your internet connection.');
    });

    it('should handle Error objects', () => {
      const error = getBeautifyError(new Error('Network connection failed'));

      expect(error.code).toBe('BEAUTIFY_NETWORK_ERROR');
      expect(error.details).toBe('Network connection failed');
    });

    it('should handle string errors', () => {
      const error = getBeautifyError('Session expired');

      expect(error.code).toBe('BEAUTIFY_AUTH_ERROR');
    });

    it('should include custom details', () => {
      const error = getBeautifyError('BEAUTIFY_AI_ERROR', 'API returned invalid JSON');

      expect(error.details).toBe('API returned invalid JSON');
    });
  });

  describe('getBeautifyErrorMessage', () => {
    it('should return the correct message for each code', () => {
      expect(getBeautifyErrorMessage('BEAUTIFY_NETWORK_ERROR')).toBe(
        'Unable to connect. Please check your internet connection.'
      );
      expect(getBeautifyErrorMessage('BEAUTIFY_TIMEOUT_ERROR')).toBe(
        'Beautification timed out. The website may be too complex. Please try again.'
      );
      expect(getBeautifyErrorMessage('BEAUTIFY_AUTH_ERROR')).toBe(
        'Session expired. Please refresh the page and try again.'
      );
    });
  });

  describe('isBeautifyErrorRetryable', () => {
    it('should return true for retryable errors', () => {
      expect(isBeautifyErrorRetryable('BEAUTIFY_NETWORK_ERROR')).toBe(true);
      expect(isBeautifyErrorRetryable('BEAUTIFY_TIMEOUT_ERROR')).toBe(true);
      expect(isBeautifyErrorRetryable('BEAUTIFY_RATE_LIMIT_ERROR')).toBe(true);
      expect(isBeautifyErrorRetryable('BEAUTIFY_PARSE_ERROR')).toBe(true);
      expect(isBeautifyErrorRetryable('BEAUTIFY_AI_ERROR')).toBe(true);
      expect(isBeautifyErrorRetryable('BEAUTIFY_UNKNOWN_ERROR')).toBe(true);
    });

    it('should return false for non-retryable errors', () => {
      expect(isBeautifyErrorRetryable('BEAUTIFY_AUTH_ERROR')).toBe(false);
      expect(isBeautifyErrorRetryable('BEAUTIFY_VALIDATION_ERROR')).toBe(false);
      expect(isBeautifyErrorRetryable('BEAUTIFY_MISSING_FIELDS')).toBe(false);
      expect(isBeautifyErrorRetryable('BEAUTIFY_INVALID_IMAGE_TYPE')).toBe(false);
      expect(isBeautifyErrorRetryable('BEAUTIFY_IMAGE_TOO_LARGE')).toBe(false);
      expect(isBeautifyErrorRetryable('BEAUTIFY_CANCELLED')).toBe(false);
    });
  });

  describe('getBeautifyErrorCategory', () => {
    it('should return correct category for each error code', () => {
      expect(getBeautifyErrorCategory('BEAUTIFY_NETWORK_ERROR')).toBe('network');
      expect(getBeautifyErrorCategory('BEAUTIFY_VALIDATION_ERROR')).toBe('validation');
      expect(getBeautifyErrorCategory('BEAUTIFY_RATE_LIMIT_ERROR')).toBe('ai');
      expect(getBeautifyErrorCategory('BEAUTIFY_AUTH_ERROR')).toBe('general');
    });
  });
});
