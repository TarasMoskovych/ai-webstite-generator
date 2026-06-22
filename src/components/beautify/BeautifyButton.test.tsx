/**
 * BeautifyButton Component Tests
 *
 * Unit tests for the BeautifyButton component.
 * Tests cover rendering, variants, loading state, disabled state, and click handling.
 *
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BeautifyButton, BeautifyButtonProps } from './BeautifyButton';

describe('BeautifyButton', () => {
  // Default props for tests
  const defaultProps: BeautifyButtonProps = {
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    /**
     * Tests that the component renders correctly with default props
     * Validates: Requirement 5.1, 5.2
     */
    it('renders correctly with default props', () => {
      render(<BeautifyButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Beautify');
      expect(button).toHaveAttribute('aria-label', 'Beautify website');
      expect(button).not.toBeDisabled();
    });

    /**
     * Tests that the sparkle icon is rendered
     * Validates: Requirement 5.2
     */
    it('renders sparkle icon', () => {
      render(<BeautifyButton {...defaultProps} />);

      // The SparklesIcon should be rendered (as an SVG)
      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    /**
     * Tests that custom className is applied
     */
    it('applies custom className', () => {
      render(<BeautifyButton {...defaultProps} className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
    });
  });

  describe('Click Handling', () => {
    /**
     * Tests that onClick is called when button is clicked (not disabled/loading)
     * Validates: Requirement 5.3
     */
    it('calls onClick when clicked', () => {
      const onClick = vi.fn();
      render(<BeautifyButton onClick={onClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    /**
     * Tests that onClick is not called when button is disabled
     */
    it('does not call onClick when disabled', () => {
      const onClick = vi.fn();
      render(<BeautifyButton onClick={onClick} disabled />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });

    /**
     * Tests that onClick is not called when button is loading
     * Validates: Requirement 5.4
     */
    it('does not call onClick when loading', () => {
      const onClick = vi.fn();
      render(<BeautifyButton onClick={onClick} isLoading />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    /**
     * Tests that loading spinner is shown when isLoading is true
     * Validates: Requirement 5.4
     */
    it('shows loading spinner when isLoading is true', () => {
      render(<BeautifyButton {...defaultProps} isLoading />);

      const button = screen.getByRole('button');
      // The SpinnerIcon should have the animate-spin class
      const spinner = button.querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    /**
     * Tests that button text changes to "Beautifying..." when loading
     * Validates: Requirement 5.4
     */
    it('shows "Beautifying..." text when loading', () => {
      render(<BeautifyButton {...defaultProps} isLoading />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Beautifying...');
      expect(button).not.toHaveTextContent(/^Beautify$/);
    });

    /**
     * Tests that aria-label changes when loading
     */
    it('updates aria-label when loading', () => {
      render(<BeautifyButton {...defaultProps} isLoading />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Beautifying website...');
    });

    /**
     * Tests that aria-busy is set when loading
     */
    it('sets aria-busy when loading', () => {
      render(<BeautifyButton {...defaultProps} isLoading />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    /**
     * Tests that button is disabled when isLoading is true
     * Validates: Requirement 5.4
     */
    it('is disabled when isLoading is true', () => {
      render(<BeautifyButton {...defaultProps} isLoading />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Disabled State', () => {
    /**
     * Tests that button is disabled when disabled prop is true
     */
    it('is disabled when disabled prop is true', () => {
      render(<BeautifyButton {...defaultProps} disabled />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    /**
     * Tests that disabled styling is applied
     */
    it('has disabled styling when disabled', () => {
      render(<BeautifyButton {...defaultProps} disabled />);

      const button = screen.getByRole('button');
      expect(button.className).toContain('disabled:opacity-50');
      expect(button.className).toContain('disabled:cursor-not-allowed');
    });

    /**
     * Tests that button shows normal text when just disabled (not loading)
     */
    it('shows "Beautify" text when disabled but not loading', () => {
      render(<BeautifyButton {...defaultProps} disabled />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Beautify');
    });
  });

  describe('Button Variants', () => {
    /**
     * Tests primary variant (default)
     */
    it('renders primary variant by default', () => {
      render(<BeautifyButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-primary');
      expect(button.className).toContain('text-primary-foreground');
    });

    /**
     * Tests explicit primary variant
     */
    it('renders primary variant when specified', () => {
      render(<BeautifyButton {...defaultProps} variant="primary" />);

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-primary');
      expect(button.className).toContain('text-primary-foreground');
    });

    /**
     * Tests secondary variant
     */
    it('renders secondary variant correctly', () => {
      render(<BeautifyButton {...defaultProps} variant="secondary" />);

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-secondary');
      expect(button.className).toContain('text-secondary-foreground');
    });

    /**
     * Tests icon-only variant
     */
    it('renders icon-only variant correctly', () => {
      render(<BeautifyButton {...defaultProps} variant="icon-only" />);

      const button = screen.getByRole('button');
      // Icon-only should have rounded-full class
      expect(button.className).toContain('rounded-full');
      // Should not show text
      expect(button).not.toHaveTextContent('Beautify');
    });

    /**
     * Tests that icon-only variant hides text even when loading
     */
    it('hides text in icon-only variant even when loading', () => {
      render(<BeautifyButton {...defaultProps} variant="icon-only" isLoading />);

      const button = screen.getByRole('button');
      // Should not show "Beautifying..." text
      expect(button).not.toHaveTextContent('Beautifying...');
      // But spinner should still be visible
      const spinner = button.querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    /**
     * Tests that button has correct type attribute
     */
    it('has type="button" attribute', () => {
      render(<BeautifyButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    /**
     * Tests that SVG icons are hidden from screen readers
     */
    it('has aria-hidden on icons', () => {
      render(<BeautifyButton {...defaultProps} />);

      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    /**
     * Tests focus ring styles are present
     */
    it('has focus-visible ring styles', () => {
      render(<BeautifyButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button.className).toContain('focus-visible:ring-2');
      expect(button.className).toContain('focus-visible:ring-ring');
    });
  });
});
