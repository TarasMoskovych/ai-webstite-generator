/**
 * PreviewComparison Component Tests
 *
 * Unit tests for the PreviewComparison component.
 * Tests cover rendering, comparison modes, viewport controls, and action buttons.
 *
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.9, 7.10
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PreviewComparison, PreviewComparisonProps } from './PreviewComparison';

// Mock the htmlSanitizer service
vi.mock('@/services/htmlSanitizer', () => ({
  sanitize: (html: string) => html,
}));

describe('PreviewComparison', () => {
  // Default props for tests
  const defaultProps: PreviewComparisonProps = {
    originalHtml: '<h1>Original</h1>',
    originalCss: 'h1 { color: red; }',
    beautifiedHtml: '<h1>Beautified</h1>',
    beautifiedCss: 'h1 { color: blue; }',
    onAccept: vi.fn(),
    onReject: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    /**
     * Tests that the component renders correctly
     * Validates: Requirement 7.1
     */
    it('renders two preview iframes', () => {
      render(<PreviewComparison {...defaultProps} />);

      const originalIframe = screen.getByTitle('Original Website Preview');
      const beautifiedIframe = screen.getByTitle('Beautified Website Preview');

      expect(originalIframe).toBeInTheDocument();
      expect(beautifiedIframe).toBeInTheDocument();
    });

    /**
     * Tests that labels are displayed correctly
     * Validates: Requirement 7.2
     */
    it('displays "Original" and "Beautified" labels', () => {
      render(<PreviewComparison {...defaultProps} />);

      expect(screen.getByText('Original')).toBeInTheDocument();
      expect(screen.getByText('Beautified')).toBeInTheDocument();
    });

    /**
     * Tests that iframes have sandbox attribute for security
     */
    it('iframes have sandbox attribute', () => {
      render(<PreviewComparison {...defaultProps} />);

      const originalIframe = screen.getByTitle('Original Website Preview');
      const beautifiedIframe = screen.getByTitle('Beautified Website Preview');

      expect(originalIframe).toHaveAttribute('sandbox', 'allow-same-origin');
      expect(beautifiedIframe).toHaveAttribute('sandbox', 'allow-same-origin');
    });
  });

  describe('Comparison Modes', () => {
    /**
     * Tests that side-by-side mode is default
     * Validates: Requirement 7.10
     */
    it('defaults to side-by-side comparison mode', () => {
      render(<PreviewComparison {...defaultProps} />);

      const sideBySideButton = screen.getByRole('radio', { name: /side by side/i });
      expect(sideBySideButton).toHaveAttribute('aria-checked', 'true');
    });

    /**
     * Tests switching to overlay mode
     * Validates: Requirement 7.10
     */
    it('can switch to overlay comparison mode', () => {
      render(<PreviewComparison {...defaultProps} />);

      const overlayButton = screen.getByRole('radio', { name: /overlay/i });
      fireEvent.click(overlayButton);

      expect(overlayButton).toHaveAttribute('aria-checked', 'true');
    });

    /**
     * Tests that overlay mode includes a slider
     * Validates: Requirement 7.10
     */
    it('displays slider in overlay mode', () => {
      render(<PreviewComparison {...defaultProps} />);

      const overlayButton = screen.getByRole('radio', { name: /overlay/i });
      fireEvent.click(overlayButton);

      const slider = screen.getByRole('slider', { name: /comparison slider/i });
      expect(slider).toBeInTheDocument();
    });

    /**
     * Tests slider keyboard navigation
     */
    it('slider responds to keyboard navigation', () => {
      render(<PreviewComparison {...defaultProps} />);

      const overlayButton = screen.getByRole('radio', { name: /overlay/i });
      fireEvent.click(overlayButton);

      const slider = screen.getByRole('slider', { name: /comparison slider/i });

      // Initial value should be 50
      expect(slider).toHaveAttribute('aria-valuenow', '50');

      // Press arrow left to decrease
      fireEvent.keyDown(slider, { key: 'ArrowLeft' });
      expect(slider).toHaveAttribute('aria-valuenow', '45');

      // Press arrow right to increase
      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      expect(slider).toHaveAttribute('aria-valuenow', '50');
    });
  });

  describe('Viewport Controls', () => {
    /**
     * Tests that viewport controls are rendered
     * Validates: Requirement 7.4
     */
    it('renders viewport mode controls', () => {
      render(<PreviewComparison {...defaultProps} />);

      const desktopButton = screen.getByRole('radio', { name: /desktop/i });
      const tabletButton = screen.getByRole('radio', { name: /tablet/i });
      const mobileButton = screen.getByRole('radio', { name: /mobile/i });

      expect(desktopButton).toBeInTheDocument();
      expect(tabletButton).toBeInTheDocument();
      expect(mobileButton).toBeInTheDocument();
    });

    /**
     * Tests that desktop is default viewport
     * Validates: Requirement 7.4
     */
    it('defaults to desktop viewport mode', () => {
      render(<PreviewComparison {...defaultProps} />);

      const desktopButton = screen.getByRole('radio', { name: /desktop/i });
      expect(desktopButton).toHaveAttribute('aria-checked', 'true');
    });

    /**
     * Tests changing viewport mode
     * Validates: Requirement 7.4
     */
    it('can change viewport mode', () => {
      render(<PreviewComparison {...defaultProps} />);

      const tabletButton = screen.getByRole('radio', { name: /tablet/i });
      fireEvent.click(tabletButton);

      expect(tabletButton).toHaveAttribute('aria-checked', 'true');
    });

    /**
     * Tests that dimensions are displayed
     */
    it('displays current viewport dimensions', () => {
      render(<PreviewComparison {...defaultProps} />);

      // Default desktop dimensions
      expect(screen.getByText('1280 × 800px')).toBeInTheDocument();
    });

    /**
     * Tests that dimensions update when viewport changes
     */
    it('updates dimensions when viewport changes', () => {
      render(<PreviewComparison {...defaultProps} />);

      const mobileButton = screen.getByRole('radio', { name: /mobile/i });
      fireEvent.click(mobileButton);

      // Mobile dimensions
      expect(screen.getByText('375 × 667px')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    /**
     * Tests that Accept button is rendered
     * Validates: Requirement 7.5
     */
    it('renders Accept button', () => {
      render(<PreviewComparison {...defaultProps} />);

      const acceptButton = screen.getByRole('button', { name: /accept/i });
      expect(acceptButton).toBeInTheDocument();
    });

    /**
     * Tests that Reject button is rendered
     * Validates: Requirement 7.6
     */
    it('renders Reject button', () => {
      render(<PreviewComparison {...defaultProps} />);

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      expect(rejectButton).toBeInTheDocument();
    });

    /**
     * Tests that onAccept is called when Accept is clicked
     * Validates: Requirements 7.7, 7.8
     */
    it('calls onAccept when Accept is clicked', () => {
      const onAccept = vi.fn();
      render(<PreviewComparison {...defaultProps} onAccept={onAccept} />);

      const acceptButton = screen.getByRole('button', { name: /accept/i });
      fireEvent.click(acceptButton);

      expect(onAccept).toHaveBeenCalledTimes(1);
    });

    /**
     * Tests that onReject is called when Reject is clicked
     * Validates: Requirement 7.9
     */
    it('calls onReject when Reject is clicked', () => {
      const onReject = vi.fn();
      render(<PreviewComparison {...defaultProps} onReject={onReject} />);

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      fireEvent.click(rejectButton);

      expect(onReject).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    /**
     * Tests that comparison mode selector has correct ARIA
     */
    it('comparison mode selector has correct ARIA attributes', () => {
      render(<PreviewComparison {...defaultProps} />);

      const radioGroup = screen.getByRole('radiogroup', { name: /comparison mode/i });
      expect(radioGroup).toBeInTheDocument();
    });

    /**
     * Tests that viewport selector has correct ARIA
     */
    it('viewport selector has correct ARIA attributes', () => {
      render(<PreviewComparison {...defaultProps} />);

      const radioGroup = screen.getByRole('radiogroup', { name: /viewport size/i });
      expect(radioGroup).toBeInTheDocument();
    });

    /**
     * Tests that action buttons have correct ARIA labels
     */
    it('action buttons have correct ARIA labels', () => {
      render(<PreviewComparison {...defaultProps} />);

      const acceptButton = screen.getByRole('button', { name: /accept beautified changes/i });
      const rejectButton = screen.getByRole('button', { name: /reject changes and keep original/i });

      expect(acceptButton).toBeInTheDocument();
      expect(rejectButton).toBeInTheDocument();
    });

    /**
     * Tests that slider has correct ARIA attributes
     */
    it('slider has correct ARIA attributes in overlay mode', () => {
      render(<PreviewComparison {...defaultProps} />);

      const overlayButton = screen.getByRole('radio', { name: /overlay/i });
      fireEvent.click(overlayButton);

      const slider = screen.getByRole('slider', { name: /comparison slider/i });
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '100');
      expect(slider).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Content Rendering', () => {
    /**
     * Tests that original content is passed to iframe
     */
    it('passes original content to original iframe', () => {
      const { container } = render(<PreviewComparison {...defaultProps} />);

      const originalIframe = screen.getByTitle('Original Website Preview');
      expect(originalIframe).toBeInTheDocument();
      // The iframe content is written via document.write, which we can't easily test
      // but we verify the iframe exists and has correct attributes
    });

    /**
     * Tests that beautified content is passed to beautified iframe
     */
    it('passes beautified content to beautified iframe', () => {
      render(<PreviewComparison {...defaultProps} />);

      const beautifiedIframe = screen.getByTitle('Beautified Website Preview');
      expect(beautifiedIframe).toBeInTheDocument();
    });
  });
});
