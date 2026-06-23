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

  describe('Copyright Display', () => {
    /**
     * Validates: Requirements 1.1
     * Verifies that the current year is dynamically displayed in the copyright notice
     */
    it('displays the current year in copyright', () => {
      render(<AppFooter />);

      const currentYear = new Date().getFullYear();
      const copyrightText = screen.getByText(new RegExp(`© ${currentYear}`));
      expect(copyrightText).toBeInTheDocument();
    });

    /**
     * Validates: Requirements 1.1
     * Verifies that a mocked year is correctly displayed when Date is mocked
     */
    it('displays the mocked year when Date.getFullYear is mocked', () => {
      // Mock Date to return a specific year (2030)
      const mockDate = new Date(2030, 0, 1);
      vi.setSystemTime(mockDate);

      render(<AppFooter />);

      const copyrightText = screen.getByText(/© 2030/);
      expect(copyrightText).toBeInTheDocument();

      // Restore real timers
      vi.useRealTimers();
    });

    /**
     * Validates: Requirements 1.1
     * Verifies that the developer name "Taras Moskovych" is displayed in the copyright notice
     */
    it('displays the developer name "Taras Moskovych"', () => {
      render(<AppFooter />);

      const copyrightText = screen.getByText(/Taras Moskovych/);
      expect(copyrightText).toBeInTheDocument();
    });

    /**
     * Validates: Requirements 1.1
     * Verifies the complete copyright format includes both year and developer name
     */
    it('displays complete copyright notice with year and developer name', () => {
      render(<AppFooter />);

      const currentYear = new Date().getFullYear();
      const copyrightText = screen.getByText(`© ${currentYear} Taras Moskovych`);
      expect(copyrightText).toBeInTheDocument();
    });
  });

  /**
   * Task 4.3: Social links tests
   * Validates: Requirements 1.2, 1.3, 4.1, 4.2, 4.3, 4.4
   */
  describe('Social Links', () => {
    const GITHUB_URL = 'https://github.com/TarasMoskovych/ai-webstite-generator';
    const LINKEDIN_URL = 'https://www.linkedin.com/in/taras-moskovych/';

    describe('GitHub Link', () => {
      /**
       * Test GitHub link has correct href
       * Validates: Requirement 1.2
       */
      it('has correct href', () => {
        render(<AppFooter />);

        const githubLink = screen.getByRole('link', { name: /github/i });
        expect(githubLink).toHaveAttribute('href', GITHUB_URL);
      });

      /**
       * Test GitHub link opens in new tab
       * Validates: Requirement 1.2
       */
      it('has target="_blank" to open in new tab', () => {
        render(<AppFooter />);

        const githubLink = screen.getByRole('link', { name: /github/i });
        expect(githubLink).toHaveAttribute('target', '_blank');
      });

      /**
       * Test GitHub link has security attributes
       * Validates: Requirement 4.1
       */
      it('has rel="noopener noreferrer" for security', () => {
        render(<AppFooter />);

        const githubLink = screen.getByRole('link', { name: /github/i });
        expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
      });

      /**
       * Test GitHub link has descriptive aria-label
       * Validates: Requirement 4.3
       */
      it('has descriptive aria-label for accessibility', () => {
        render(<AppFooter />);

        const githubLink = screen.getByRole('link', { name: /github/i });
        expect(githubLink).toHaveAttribute('aria-label');

        const ariaLabel = githubLink.getAttribute('aria-label');
        // Verify aria-label is descriptive (mentions GitHub and new tab)
        expect(ariaLabel).toMatch(/github/i);
        expect(ariaLabel).toMatch(/new tab/i);
      });
    });

    describe('LinkedIn Link', () => {
      /**
       * Test LinkedIn link has correct href
       * Validates: Requirement 1.3
       */
      it('has correct href', () => {
        render(<AppFooter />);

        const linkedinLink = screen.getByRole('link', { name: /linkedin/i });
        expect(linkedinLink).toHaveAttribute('href', LINKEDIN_URL);
      });

      /**
       * Test LinkedIn link opens in new tab
       * Validates: Requirement 1.3
       */
      it('has target="_blank" to open in new tab', () => {
        render(<AppFooter />);

        const linkedinLink = screen.getByRole('link', { name: /linkedin/i });
        expect(linkedinLink).toHaveAttribute('target', '_blank');
      });

      /**
       * Test LinkedIn link has security attributes
       * Validates: Requirement 4.2
       */
      it('has rel="noopener noreferrer" for security', () => {
        render(<AppFooter />);

        const linkedinLink = screen.getByRole('link', { name: /linkedin/i });
        expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
      });

      /**
       * Test LinkedIn link has descriptive aria-label
       * Validates: Requirement 4.4
       */
      it('has descriptive aria-label for accessibility', () => {
        render(<AppFooter />);

        const linkedinLink = screen.getByRole('link', { name: /linkedin/i });
        expect(linkedinLink).toHaveAttribute('aria-label');

        const ariaLabel = linkedinLink.getAttribute('aria-label');
        // Verify aria-label is descriptive (mentions LinkedIn and new tab)
        expect(ariaLabel).toMatch(/linkedin/i);
        expect(ariaLabel).toMatch(/new tab/i);
      });
    });
  });

  // Additional tests will be added in subsequent tasks:
  // - 4.4: Call-to-action text tests

  /**
   * Task 4.5: Accessibility and semantic tests
   * Validates: Requirements 4.5
   */
  describe('Accessibility and Semantic HTML', () => {
    /**
     * Test that footer uses semantic <footer> element
     * Validates: Requirement 4.5 - THE App_Footer SHALL use semantic HTML elements
     */
    it('uses semantic footer element', () => {
      const { container } = render(<AppFooter />);

      const footerElement = container.querySelector('footer');
      expect(footerElement).toBeInTheDocument();
    });

    /**
     * Test that footer has role="contentinfo" for accessibility
     * Validates: Requirement 4.5 - appropriate ARIA roles for accessibility
     */
    it('has role="contentinfo" for accessibility', () => {
      render(<AppFooter />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    /**
     * Test that icons have aria-hidden="true" for accessibility
     * Validates: Requirement 4.5 - appropriate ARIA attributes for accessibility
     * Icons are decorative and should be hidden from screen readers
     */
    it('icons have aria-hidden="true"', () => {
      const { container } = render(<AppFooter />);

      // Find all SVG icons within the footer
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);

      // Each icon should have aria-hidden="true"
      svgIcons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    /**
     * Test that social links navigation has proper aria-label
     * Validates: Requirement 4.5 - appropriate ARIA roles for accessibility
     */
    it('social links navigation has aria-label', () => {
      render(<AppFooter />);

      const nav = screen.getByRole('navigation', { name: /social links/i });
      expect(nav).toBeInTheDocument();
    });
  });

  describe('className Prop', () => {
    /**
     * Validates: Component API
     * Test that custom className is applied to footer element
     */
    it('applies custom className to footer element', () => {
      const customClass = 'custom-footer-class';
      render(<AppFooter className={customClass} />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass(customClass);
    });

    /**
     * Validates: Component API
     * Test that multiple custom classes are applied correctly
     */
    it('applies multiple custom classes to footer element', () => {
      const customClasses = 'class-one class-two';
      render(<AppFooter className={customClasses} />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('class-one');
      expect(footer).toHaveClass('class-two');
    });

    /**
     * Validates: Component API
     * Test that default classes are preserved when custom className is provided
     */
    it('preserves default classes when custom className is provided', () => {
      const customClass = 'custom-class';
      render(<AppFooter className={customClass} />);

      const footer = screen.getByRole('contentinfo');
      // Default classes from the component should still be present
      expect(footer).toHaveClass('border-t');
      expect(footer).toHaveClass('bg-background');
      // Custom class should also be present
      expect(footer).toHaveClass(customClass);
    });

    /**
     * Validates: Component API
     * Test that component renders correctly without className prop
     */
    it('renders correctly without className prop', () => {
      render(<AppFooter />);

      const footer = screen.getByRole('contentinfo');
      // Should still have default classes
      expect(footer).toHaveClass('border-t');
      expect(footer).toHaveClass('bg-background');
    });
  });
});
