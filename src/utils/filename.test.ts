/**
 * sanitizeFilename Utility Property Tests
 *
 * Property-based tests for the sanitizeFilename utility function.
 *
 * Tests verify:
 * - Output contains only valid characters [a-z0-9-]
 * - No consecutive hyphens in output
 * - Maximum 50 characters length
 * - Non-empty output (either valid or 'website' fallback)
 *
 * **Validates: Requirements 3.3, 3.4**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { sanitizeFilename } from './filename';

describe('sanitizeFilename', () => {
  // Feature: page-refactoring, Property 1: sanitizeFilename Transformation Invariants
  it('should produce valid filename for any input', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = sanitizeFilename(input);

        // Only contains valid characters [a-z0-9-] or is the fallback 'website'
        expect(result).toMatch(/^[a-z0-9-]*$|^website$/);

        // No consecutive hyphens
        expect(result).not.toContain('--');

        // Max length 50
        expect(result.length).toBeLessThanOrEqual(50);

        // Non-empty (either valid or 'website')
        expect(result.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  // Additional property: lowercase transformation
  it('should always produce lowercase output', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = sanitizeFilename(input);

        // Result should equal its lowercase version
        expect(result).toBe(result.toLowerCase());
      }),
      { numRuns: 100 }
    );
  });

  // Additional property: fallback behavior for empty/invalid inputs
  it('should return website fallback for inputs that produce empty sanitized result', () => {
    fc.assert(
      fc.property(
        // Generate strings with only special characters (no alphanumeric)
        fc.string({
          unit: fc.constantFrom('!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '=', '+', '[', ']', '{', '}', '|', '\\', ':', ';', '"', "'", '<', '>', ',', '.', '?', '/'),
          minLength: 0,
          maxLength: 20,
        }),
        (input) => {
          const result = sanitizeFilename(input);

          // Should fallback to 'website' when input has no valid characters
          expect(result).toBe('website');
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional property: idempotent on already valid inputs
  it('should preserve already valid lowercase alphanumeric inputs', () => {
    fc.assert(
      fc.property(
        // Generate valid filenames: lowercase letters and digits, no consecutive hyphens, max 50 chars
        fc.string({
          unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')),
          minLength: 1,
          maxLength: 50,
        }),
        (input) => {
          const result = sanitizeFilename(input);

          // Valid alphanumeric-only input should be preserved
          expect(result).toBe(input);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional property: whitespace becomes hyphens
  it('should convert whitespace sequences to single hyphens', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.string({
            unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')),
            minLength: 1,
            maxLength: 10,
          }),
          fc.string({
            unit: fc.constantFrom(' ', '\t', '\n'),
            minLength: 1,
            maxLength: 5,
          }),
          fc.string({
            unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')),
            minLength: 1,
            maxLength: 10,
          })
        ),
        ([prefix, whitespace, suffix]) => {
          const input = prefix + whitespace + suffix;
          const result = sanitizeFilename(input);

          // Whitespace should become a single hyphen
          expect(result).toContain('-');
          // No consecutive hyphens
          expect(result).not.toContain('--');
        }
      ),
      { numRuns: 100 }
    );
  });
});
