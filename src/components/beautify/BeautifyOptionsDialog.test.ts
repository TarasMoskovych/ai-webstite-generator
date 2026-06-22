/**
 * BeautifyOptionsDialog Property-Based Tests
 *
 * Property-based tests for image validation in the BeautifyOptionsDialog.
 * Tests verify the image size and format validation constraints.
 *
 * Validates: Requirements 0.1.5, 0.1.6
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  validateReferenceImageSize,
  validateReferenceImageMimeType,
  validateReferenceImage,
  isValidReferenceImageMimeType,
  MAX_REFERENCE_IMAGE_SIZE_BYTES,
  ALLOWED_REFERENCE_IMAGE_MIME_TYPES,
} from '@/lib/referenceImageValidation';

describe('BeautifyOptionsDialog Image Validation', () => {
  /**
   * Unit tests for image size validation
   */
  describe('validateReferenceImageSize', () => {
    it('should accept file at exactly the size limit', () => {
      const result = validateReferenceImageSize(MAX_REFERENCE_IMAGE_SIZE_BYTES);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept file just under the size limit', () => {
      const result = validateReferenceImageSize(MAX_REFERENCE_IMAGE_SIZE_BYTES - 1);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject file just over the size limit', () => {
      const result = validateReferenceImageSize(MAX_REFERENCE_IMAGE_SIZE_BYTES + 1);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds the maximum limit');
    });

    it('should accept 1 byte file', () => {
      const result = validateReferenceImageSize(1);
      expect(result.valid).toBe(true);
    });

    it('should reject 0 byte file', () => {
      const result = validateReferenceImageSize(0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('greater than 0');
    });

    it('should reject negative file size', () => {
      const result = validateReferenceImageSize(-1);
      expect(result.valid).toBe(false);
    });

    it('should accept typical image sizes (1KB, 100KB, 1MB, 5MB)', () => {
      const sizes = [1024, 100 * 1024, 1024 * 1024, 5 * 1024 * 1024];
      sizes.forEach((size) => {
        const result = validateReferenceImageSize(size);
        expect(result.valid).toBe(true);
      });
    });
  });

  /**
   * Unit tests for image MIME type validation
   */
  describe('validateReferenceImageMimeType', () => {
    it('should accept image/png', () => {
      const result = validateReferenceImageMimeType('image/png');
      expect(result.valid).toBe(true);
    });

    it('should accept image/jpeg', () => {
      const result = validateReferenceImageMimeType('image/jpeg');
      expect(result.valid).toBe(true);
    });

    it('should accept image/webp', () => {
      const result = validateReferenceImageMimeType('image/webp');
      expect(result.valid).toBe(true);
    });

    it('should reject image/gif', () => {
      const result = validateReferenceImageMimeType('image/gif');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file format');
    });

    it('should reject image/bmp', () => {
      const result = validateReferenceImageMimeType('image/bmp');
      expect(result.valid).toBe(false);
    });

    it('should reject image/svg+xml', () => {
      const result = validateReferenceImageMimeType('image/svg+xml');
      expect(result.valid).toBe(false);
    });

    it('should reject application/pdf', () => {
      const result = validateReferenceImageMimeType('application/pdf');
      expect(result.valid).toBe(false);
    });

    it('should reject empty string', () => {
      const result = validateReferenceImageMimeType('');
      expect(result.valid).toBe(false);
    });

    it('should be case-sensitive (reject IMAGE/PNG)', () => {
      const result = validateReferenceImageMimeType('IMAGE/PNG');
      expect(result.valid).toBe(false);
    });
  });

  /**
   * Unit tests for isValidReferenceImageMimeType type guard
   */
  describe('isValidReferenceImageMimeType', () => {
    it('should return true for all allowed MIME types', () => {
      ALLOWED_REFERENCE_IMAGE_MIME_TYPES.forEach((mimeType) => {
        expect(isValidReferenceImageMimeType(mimeType)).toBe(true);
      });
    });

    it('should return false for invalid MIME types', () => {
      expect(isValidReferenceImageMimeType('image/gif')).toBe(false);
      expect(isValidReferenceImageMimeType('text/plain')).toBe(false);
      expect(isValidReferenceImageMimeType('')).toBe(false);
    });
  });

  /**
   * Unit tests for combined validation
   */
  describe('validateReferenceImage', () => {
    it('should accept valid MIME type and valid size', () => {
      const result = validateReferenceImage('image/png', 1024 * 1024);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid MIME type even with valid size', () => {
      const result = validateReferenceImage('image/gif', 1024);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file format');
    });

    it('should reject valid MIME type with invalid size', () => {
      const result = validateReferenceImage('image/png', MAX_REFERENCE_IMAGE_SIZE_BYTES + 1);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds the maximum limit');
    });

    it('should reject both invalid MIME type and size (MIME type error takes precedence)', () => {
      const result = validateReferenceImage('image/gif', MAX_REFERENCE_IMAGE_SIZE_BYTES + 1);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file format');
    });
  });

  /**
   * Property-Based Tests
   *
   * These tests verify universal properties across generated inputs using fast-check.
   */
  describe('Property-Based Tests', () => {
    /**
     * Feature: website-beautify, Property 13: Image Upload Size Validation
     *
     * *For any* reference image exceeding 10MB in size, the upload validation SHALL reject the image.
     *
     * **Validates: Requirements 0.1.6**
     */
    it('image size validation should reject any file exceeding 10MB (Property 13)', () => {
      fc.assert(
        fc.property(
          // Generate file sizes that exceed the maximum (10MB + 1 byte to 100MB)
          fc.integer({ min: MAX_REFERENCE_IMAGE_SIZE_BYTES + 1, max: 100 * 1024 * 1024 }),
          (oversizedFileSize) => {
            // Ensure the generated size is actually over the limit
            expect(oversizedFileSize).toBeGreaterThan(MAX_REFERENCE_IMAGE_SIZE_BYTES);

            // Validation MUST reject any file exceeding the size limit
            const result = validateReferenceImageSize(oversizedFileSize);

            // Property assertion: Any file size > MAX_REFERENCE_IMAGE_SIZE_BYTES
            // MUST be rejected
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error).toContain('exceeds the maximum limit');
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Complementary property: Files within the size limit should be accepted
     *
     * *For any* reference image with size ≤ 10MB and > 0, the upload validation SHALL accept the image.
     *
     * **Validates: Requirements 0.1.6**
     */
    it('image size validation should accept any file within 10MB limit (Property 13 complement)', () => {
      fc.assert(
        fc.property(
          // Generate file sizes within the valid range (1 byte to 10MB)
          fc.integer({ min: 1, max: MAX_REFERENCE_IMAGE_SIZE_BYTES }),
          (validFileSize) => {
            // Ensure the generated size is within limits
            expect(validFileSize).toBeGreaterThan(0);
            expect(validFileSize).toBeLessThanOrEqual(MAX_REFERENCE_IMAGE_SIZE_BYTES);

            // Validation MUST accept any file within the size limit
            const result = validateReferenceImageSize(validFileSize);

            // Property assertion: Any file size > 0 and <= MAX_REFERENCE_IMAGE_SIZE_BYTES
            // MUST be accepted
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: website-beautify, Property 14: Image Format Acceptance
     *
     * *For any* image file with MIME type image/png, image/jpeg, or image/webp,
     * the upload validation SHALL accept the file.
     *
     * **Validates: Requirements 0.1.5**
     */
    it('image format validation should accept PNG, JPEG, and WebP (Property 14)', () => {
      fc.assert(
        fc.property(
          // Generate one of the valid MIME types
          fc.constantFrom('image/png', 'image/jpeg', 'image/webp'),
          (validMimeType) => {
            // Ensure the generated MIME type is one of the allowed types
            expect(ALLOWED_REFERENCE_IMAGE_MIME_TYPES).toContain(validMimeType);

            // Validation MUST accept any of the allowed MIME types
            const result = validateReferenceImageMimeType(validMimeType);

            // Property assertion: Any allowed MIME type MUST be accepted
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();

            // Also verify using the type guard function
            expect(isValidReferenceImageMimeType(validMimeType)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Complementary property: Invalid formats should be rejected
     *
     * *For any* image file with MIME type NOT in (image/png, image/jpeg, image/webp),
     * the upload validation SHALL reject the file.
     *
     * **Validates: Requirements 0.1.5**
     */
    it('image format validation should reject invalid MIME types (Property 14 complement)', () => {
      // Common invalid MIME types for images and other file types
      const invalidMimeTypes = [
        'image/gif',
        'image/bmp',
        'image/svg+xml',
        'image/tiff',
        'image/x-icon',
        'image/heic',
        'image/heif',
        'image/avif',
        'application/pdf',
        'application/json',
        'text/plain',
        'text/html',
        'video/mp4',
        'audio/mpeg',
      ];

      fc.assert(
        fc.property(
          // Generate one of the invalid MIME types
          fc.constantFrom(...invalidMimeTypes),
          (invalidMimeType) => {
            // Ensure the generated MIME type is NOT one of the allowed types
            expect(ALLOWED_REFERENCE_IMAGE_MIME_TYPES).not.toContain(invalidMimeType);

            // Validation MUST reject any MIME type not in the allowed list
            const result = validateReferenceImageMimeType(invalidMimeType);

            // Property assertion: Any MIME type not in ALLOWED_REFERENCE_IMAGE_MIME_TYPES
            // MUST be rejected
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Invalid file format');

            // Also verify using the type guard function
            expect(isValidReferenceImageMimeType(invalidMimeType)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Combined property: Valid format and valid size should be accepted
     *
     * *For any* reference image with a valid MIME type AND valid size,
     * the combined validation SHALL accept the image.
     *
     * **Validates: Requirements 0.1.5, 0.1.6**
     */
    it('combined validation should accept valid format AND valid size', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('image/png', 'image/jpeg', 'image/webp'),
          fc.integer({ min: 1, max: MAX_REFERENCE_IMAGE_SIZE_BYTES }),
          (validMimeType, validSize) => {
            // Combined validation MUST accept when both conditions are met
            const result = validateReferenceImage(validMimeType, validSize);

            // Property assertion: Valid MIME type AND valid size MUST be accepted
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Combined property: Invalid format should be rejected regardless of size
     *
     * *For any* reference image with an invalid MIME type, the combined validation
     * SHALL reject the image regardless of size.
     *
     * **Validates: Requirements 0.1.5, 0.1.6**
     */
    it('combined validation should reject invalid format regardless of size', () => {
      const invalidMimeTypes = ['image/gif', 'image/bmp', 'application/pdf'];

      fc.assert(
        fc.property(
          fc.constantFrom(...invalidMimeTypes),
          // Use any size - even valid sizes should be rejected for invalid formats
          fc.integer({ min: 1, max: MAX_REFERENCE_IMAGE_SIZE_BYTES }),
          (invalidMimeType, anySize) => {
            // Combined validation MUST reject invalid MIME types
            const result = validateReferenceImage(invalidMimeType, anySize);

            // Property assertion: Invalid MIME type MUST be rejected
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Invalid file format');
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Combined property: Oversized files should be rejected even with valid format
     *
     * *For any* reference image with a valid MIME type but size exceeding 10MB,
     * the combined validation SHALL reject the image.
     *
     * **Validates: Requirements 0.1.5, 0.1.6**
     */
    it('combined validation should reject oversized files even with valid format', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('image/png', 'image/jpeg', 'image/webp'),
          fc.integer({ min: MAX_REFERENCE_IMAGE_SIZE_BYTES + 1, max: 50 * 1024 * 1024 }),
          (validMimeType, oversizedSize) => {
            // Combined validation MUST reject oversized files
            const result = validateReferenceImage(validMimeType, oversizedSize);

            // Property assertion: Oversized files MUST be rejected
            expect(result.valid).toBe(false);
            expect(result.error).toContain('exceeds the maximum limit');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
