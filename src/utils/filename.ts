/**
 * Sanitizes a title string for use as a filename
 *
 * Transformation order:
 * 1. Convert to lowercase
 * 2. Remove characters not matching [a-z0-9\s-]
 * 3. Replace whitespace sequences with single hyphens
 * 4. Collapse consecutive hyphens into single hyphen
 * 5. Truncate to maximum 50 characters
 *
 * @param title - The title to sanitize
 * @returns Sanitized filename string, or 'website' if result is empty
 */
export function sanitizeFilename(title: string): string {
  const sanitized = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);

  return sanitized || 'website';
}
