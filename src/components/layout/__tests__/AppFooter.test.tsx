/**
 * AppFooter Component Tests
 *
 * Unit tests for the AppFooter component that displays copyright notice,
 * social links, and call-to-action text.
 *
 * Validates: Requirements 1.1-1.5, 3.1, 3.3, 4.1-4.5, 5.1-5.3, 6.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppFooter } from '../AppFooter';

describe('AppFooter Component', () => {
  // Store original Date to restore after tests
  const originalDate = global.Date;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original Date
    global.Date = originalDate;
  });

  describe('Component Setup', () => {
    /**
     * Verifies the component renders without crashing
     * This is a basic smoke test to ensure the test setup is correct
     */
    it('renders without crashing', () => {
      render(<AppFooter />);

      // Verify footer element is in the document
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });
  });

  // Additional tests will be added in subsequent tasks:
  // - 4.2: Copyright display tests
  // - 4.3: Social links tests
  // - 4.4: Call-to-action text tests
  // - 4.5: Accessibility and semantic tests
  // - 4.6: className prop test
});
