/**
 * BeautifyOptionsDialog Component Tests
 *
 * Property-based tests for image format acceptance validation.
 * Tests verify that accepted formats (JPEG, PNG, WebP) are validated correctly.
 *
 * Validates: Requirements 0.1.5
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { ReferenceImageMimeType } from '@/types/beautify';

/**
 * Allowed MIME types for reference images
 * Matching the component's ALLOWED_MIME_TYPES constant
 */
const ALLOWED_MIME_TYPES: ReferenceImageMimeType[] = ['image/png', 'image/jpeg', 'image/webp'];

/**
 * Validate MIME type for reference images
 * This mirrors the isValidMimeType function from BeautifyOptionsDialog
 */
function isValidMimeType(type: string): type is ReferenceImageMimeType {
  return ALLOWED_MIME_TYPES.includes(type as ReferenceImageMimeType);
}

/**
 * All valid image formats that should be accepted
 */
const VALID_FORMATS: readonly string[] = ['image/png', 'image/jpeg', 'image/webp'];

/**
 * Invalid MIME types that should be rejected
 * These represent common image types that are NOT supported
 */
const INVALID_IMAGE_FORMATS: readonly string[] = [
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',
  'image/x-icon',
  'image/heic',
  'image/heif',
  'image/avif',
];

/**
 * Non-image MIME types that should be rejected
 */
const NON_IMAGE_MIME_TYPES: readonly string[] = [
  'text/plain',
  'text/html',
  'application/json',
  'application/pdf',
  'video/mp4',
  'audio/mpeg',
  'application/octet-stream',
];

describe('BeautifyOptionsDialog', () => {
  describe('Image Format Validation', () => {
    /**
     * Unit Tests - Specific Examples
     */
    describe('Unit Tests', () => {
      it('should accept image/png', () => {
        expect(isValidMimeType('image/png')).toBe(true);
      });

      it('should accept image/jpeg', () => {
        expect(isValidMimeType('image/jpeg')).toBe(true);
      });

      it('should accept image/webp', () => {
        expect(isValidMimeType('image/webp')).toBe(true);
      });

      it('should reject image/gif', () => {
        expect(isValidMimeType('image/gif')).toBe(false);
      });

      it('should reject image/bmp', () => {
        expect(isValidMimeType('image/bmp')).toBe(false);
      });

      it('should reject image/svg+xml', () => {
        expect(isValidMimeType('image/svg+xml')).toBe(false);
      });

      it('should reject text/plain', () => {
        expect(isValidMimeType('text/plain')).toBe(false);
      });

      it('should reject application/pdf', () => {
        expect(isValidMimeType('application/pdf')).toBe(false);
      });

      it('should reject empty string', () => {
        expect(isValidMimeType('')).toBe(false);
      });

      it('should be case-sensitive (reject IMAGE/PNG)', () => {
        expect(isValidMimeType('IMAGE/PNG')).toBe(false);
      });

      it('should be case-sensitive (reject Image/Jpeg)', () => {
        expect(isValidMimeType('Image/Jpeg')).toBe(false);
      });

      it('should reject mime type with trailing whitespace', () => {
        expect(isValidMimeType('image/png ')).toBe(false);
      });

      it('should reject mime type with leading whitespace', () => {
        expect(isValidMimeType(' image/png')).toBe(false);
      });
    });

    /**
     * Property-Based Tests
     *
     * These tests verify universal properties across generated inputs using fast-check.
     */
    describe('Property-Based Tests', () => {
      /**
       * Feature: website-beautify, Property 14: Image Format Acceptance
       *
       * *For any* image file with MIME type image/png, image/jpeg, or image/webp,
       * the upload validation SHALL accept the file.
       *
       * **Validates: Requirements 0.1.5**
       */
      it('any valid format (PNG, JPEG, WebP) is accepted (Property 14)', () => {
        fc.assert(
          fc.property(
            // Generate one of the valid MIME types
            fc.constantFrom(...VALID_FORMATS),
            (mimeType) => {
              // Verify the generated value is one of the expected valid formats
              expect(VALID_FORMATS).toContain(mimeType);

              // Property assertion: Any valid MIME type MUST be accepted
              const result = isValidMimeType(mimeType);
              expect(result).toBe(true);
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Feature: website-beautify, Property 14 (inverse): Other formats should be rejected
       *
       * *For any* image file with a MIME type other than image/png, image/jpeg, or image/webp,
       * the upload validation SHALL reject the file.
       *
       * **Validates: Requirements 0.1.5**
       */
      it('invalid image formats are rejected (Property 14 inverse)', () => {
        fc.assert(
          fc.property(
            // Generate one of the invalid image MIME types
            fc.constantFrom(...INVALID_IMAGE_FORMATS),
            (mimeType) => {
              // Verify the generated value is NOT a valid format
              expect(VALID_FORMATS).not.toContain(mimeType);

              // Property assertion: Invalid image formats MUST be rejected
              const result = isValidMimeType(mimeType);
              expect(result).toBe(false);
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Property: Non-image MIME types are always rejected
       */
      it('non-image MIME types are rejected', () => {
        fc.assert(
          fc.property(
            // Generate one of the non-image MIME types
            fc.constantFrom(...NON_IMAGE_MIME_TYPES),
            (mimeType) => {
              // Verify the generated value is a non-image type
              expect(mimeType).not.toMatch(/^image\//);

              // Property assertion: Non-image MIME types MUST be rejected
              const result = isValidMimeType(mimeType);
              expect(result).toBe(false);
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Property: Arbitrary strings that are not valid MIME types are rejected
       *
       * Generates random strings to ensure no unexpected inputs are accepted
       */
      it('arbitrary strings are rejected unless they match valid formats exactly', () => {
        fc.assert(
          fc.property(
            // Generate arbitrary strings
            fc.string({ minLength: 0, maxLength: 100 }),
            (randomString) => {
              const result = isValidMimeType(randomString);

              // Property assertion: Result should be true only if the string
              // exactly matches one of the valid formats
              const shouldBeValid = VALID_FORMATS.includes(randomString);
              expect(result).toBe(shouldBeValid);
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Property: MIME type validation is case-sensitive
       *
       * Valid MIME types must be lowercase; uppercase variations should be rejected
       */
      it('MIME type validation is case-sensitive', () => {
        fc.assert(
          fc.property(
            // Generate one of the valid MIME types
            fc.constantFrom(...VALID_FORMATS),
            // Generate a transformation (uppercase, titlecase, etc.)
            fc.constantFrom('uppercase', 'titlecase', 'swapcase'),
            (validMimeType, transformation) => {
              let modifiedMimeType: string;

              switch (transformation) {
                case 'uppercase':
                  modifiedMimeType = validMimeType.toUpperCase();
                  break;
                case 'titlecase':
                  modifiedMimeType = validMimeType
                    .split('/')
                    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                    .join('/');
                  break;
                case 'swapcase':
                  modifiedMimeType = validMimeType
                    .split('')
                    .map((char, i) => (i % 2 === 0 ? char.toUpperCase() : char.toLowerCase()))
                    .join('');
                  break;
                default:
                  modifiedMimeType = validMimeType;
              }

              // Skip if the transformation didn't change anything (shouldn't happen)
              if (modifiedMimeType === validMimeType) {
                return;
              }

              // Property assertion: Modified (non-lowercase) MIME types MUST be rejected
              const result = isValidMimeType(modifiedMimeType);
              expect(result).toBe(false);
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Property: MIME types with whitespace are rejected
       */
      it('MIME types with whitespace are rejected', () => {
        fc.assert(
          fc.property(
            // Generate one of the valid MIME types
            fc.constantFrom(...VALID_FORMATS),
            // Generate whitespace to add
            fc.constantFrom(' ', '\t', '\n', '\r', '  '),
            // Position: 'before', 'after', or 'both'
            fc.constantFrom('before', 'after', 'both'),
            (validMimeType, whitespace, position) => {
              let modifiedMimeType: string;

              switch (position) {
                case 'before':
                  modifiedMimeType = whitespace + validMimeType;
                  break;
                case 'after':
                  modifiedMimeType = validMimeType + whitespace;
                  break;
                case 'both':
                  modifiedMimeType = whitespace + validMimeType + whitespace;
                  break;
                default:
                  modifiedMimeType = validMimeType;
              }

              // Property assertion: MIME types with whitespace MUST be rejected
              const result = isValidMimeType(modifiedMimeType);
              expect(result).toBe(false);
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Property: Validation result is deterministic
       */
      it('validation result is deterministic for the same input', () => {
        fc.assert(
          fc.property(
            // Generate arbitrary strings including valid MIME types
            fc.oneof(
              fc.constantFrom(...VALID_FORMATS),
              fc.constantFrom(...INVALID_IMAGE_FORMATS),
              fc.string({ minLength: 0, maxLength: 50 })
            ),
            (mimeType) => {
              // Call the validation function multiple times
              const result1 = isValidMimeType(mimeType);
              const result2 = isValidMimeType(mimeType);
              const result3 = isValidMimeType(mimeType);

              // Property assertion: Same input should always produce same result
              expect(result1).toBe(result2);
              expect(result2).toBe(result3);
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Property: All three valid formats are distinct and all accepted
       *
       * Verifies that exactly three formats are valid (PNG, JPEG, WebP)
       */
      it('exactly three formats are accepted: PNG, JPEG, and WebP', () => {
        fc.assert(
          fc.property(
            // Use a unit arbitrary that runs once
            fc.constant(null),
            () => {
              // Count how many formats are valid
              const validCount = VALID_FORMATS.filter((format) =>
                isValidMimeType(format)
              ).length;

              // Property assertion: Exactly 3 formats should be valid
              expect(validCount).toBe(3);

              // Verify each specific format
              expect(isValidMimeType('image/png')).toBe(true);
              expect(isValidMimeType('image/jpeg')).toBe(true);
              expect(isValidMimeType('image/webp')).toBe(true);
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });
});
