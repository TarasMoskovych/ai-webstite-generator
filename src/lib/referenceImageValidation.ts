/**
 * Reference Image Validation Utilities
 *
 * Validation functions for reference images uploaded during beautification.
 * These functions validate:
 * - File format/MIME type (PNG, JPEG, WebP)
 * - File size (max 10MB)
 *
 * Requirements:
 * - 0.1.5: Accept PNG, JPG, JPEG, WebP formats
 * - 0.1.6: Validate 10MB size limit
 */

import { VALIDATION } from '@/lib/constants';
import type { ReferenceImageMimeType } from '@/types/beautify';

/**
 * Allowed MIME types for reference images
 */
export const ALLOWED_REFERENCE_IMAGE_MIME_TYPES: readonly ReferenceImageMimeType[] = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const;

/**
 * Maximum file size in bytes for reference images (10MB)
 * Uses the same constant as screenshot input validation
 */
export const MAX_REFERENCE_IMAGE_SIZE_BYTES = VALIDATION.SCREENSHOT_INPUT.MAX_SIZE_BYTES;

/**
 * Validation result interface
 */
export interface ReferenceImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Checks if a MIME type is valid for reference images
 *
 * @param mimeType - The MIME type to validate
 * @returns True if the MIME type is allowed, false otherwise
 *
 * Validates: Requirement 0.1.5
 */
export function isValidReferenceImageMimeType(mimeType: string): mimeType is ReferenceImageMimeType {
  return ALLOWED_REFERENCE_IMAGE_MIME_TYPES.includes(mimeType as ReferenceImageMimeType);
}

/**
 * Validates the size of a reference image
 *
 * @param sizeInBytes - The file size in bytes
 * @returns Validation result with error message if invalid
 *
 * Validates: Requirement 0.1.6
 */
export function validateReferenceImageSize(sizeInBytes: number): ReferenceImageValidationResult {
  if (sizeInBytes <= 0) {
    return {
      valid: false,
      error: 'File size must be greater than 0.',
    };
  }

  if (sizeInBytes > MAX_REFERENCE_IMAGE_SIZE_BYTES) {
    const maxSizeMB = MAX_REFERENCE_IMAGE_SIZE_BYTES / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds the maximum limit of ${maxSizeMB}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Validates the MIME type of a reference image
 *
 * @param mimeType - The MIME type to validate
 * @returns Validation result with error message if invalid
 *
 * Validates: Requirement 0.1.5
 */
export function validateReferenceImageMimeType(mimeType: string): ReferenceImageValidationResult {
  if (!isValidReferenceImageMimeType(mimeType)) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload a PNG, JPEG, or WebP image.',
    };
  }

  return { valid: true };
}

/**
 * Validates a reference image file (both MIME type and size)
 *
 * @param mimeType - The MIME type of the file
 * @param sizeInBytes - The file size in bytes
 * @returns Validation result with error message if invalid
 *
 * Validates: Requirements 0.1.5, 0.1.6
 */
export function validateReferenceImage(
  mimeType: string,
  sizeInBytes: number
): ReferenceImageValidationResult {
  // Validate MIME type first
  const mimeTypeResult = validateReferenceImageMimeType(mimeType);
  if (!mimeTypeResult.valid) {
    return mimeTypeResult;
  }

  // Then validate size
  const sizeResult = validateReferenceImageSize(sizeInBytes);
  if (!sizeResult.valid) {
    return sizeResult;
  }

  return { valid: true };
}
