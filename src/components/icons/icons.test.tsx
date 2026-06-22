/**
 * Icons Module Unit Tests
 *
 * Unit tests for the shared Icons module.
 * Tests cover:
 * - All expected icons are exported from the module
 * - Each icon accepts className prop
 * - Each icon has aria-hidden="true" attribute
 *
 * Validates: Requirements 1.2, 1.3, 13.2
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as Icons from './index';

// List of all expected icon exports from the module
const expectedIcons = [
  'GlobeIcon',
  'ChevronLeftIcon',
  'ChevronRightIcon',
  'ArrowLeftIcon',
  'ArrowRightIcon',
  'CheckIcon',
  'XIcon',
  'TrashIcon',
  'EditIcon',
  'TextIcon',
  'ImageIcon',
  'SparklesIcon',
  'DownloadIcon',
  'CodeIcon',
  'PanelLeftIcon',
  'PanelRightIcon',
  'MaximizeIcon',
  'MinimizeIcon',
  'PlusIcon',
] as const;

// Get all icon components from the module (excluding non-component exports like IconProps)
const iconComponents = Object.entries(Icons).filter(
  ([name, value]) => name.endsWith('Icon') && typeof value === 'function'
) as [string, (props: Icons.IconProps) => JSX.Element][];

describe('Icons Module', () => {
  describe('Module Exports', () => {
    /**
     * Tests that all expected icons are exported from the module
     * Validates: Requirement 1.1
     */
    it('exports all 19 required icon components', () => {
      expect(iconComponents.length).toBe(19);
    });

    /**
     * Tests that each expected icon is exported
     * Validates: Requirement 1.1
     */
    it.each(expectedIcons)('exports %s', (iconName) => {
      expect(Icons).toHaveProperty(iconName);
      expect(typeof Icons[iconName as keyof typeof Icons]).toBe('function');
    });

    /**
     * Tests that IconProps interface is exported
     */
    it('exports IconProps type', () => {
      // TypeScript will validate this at compile time
      // This test ensures the export is accessible at runtime
      const testProps: Icons.IconProps = { className: 'test-class' };
      expect(testProps).toBeDefined();
    });
  });

  describe('Icon Component Rendering', () => {
    /**
     * Tests that each icon renders without crashing
     * Validates: Requirements 1.2, 1.3
     */
    it.each(iconComponents)('%s renders correctly', (name, IconComponent) => {
      const { container } = render(<IconComponent />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    /**
     * Tests that each icon renders an SVG element
     */
    it.each(iconComponents)('%s renders an SVG element', (name, IconComponent) => {
      const { container } = render(<IconComponent />);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg?.tagName.toLowerCase()).toBe('svg');
    });
  });

  describe('className Prop', () => {
    /**
     * Tests that each icon accepts and applies className prop
     * Validates: Requirement 1.2
     */
    it.each(iconComponents)(
      '%s accepts className prop',
      (name, IconComponent) => {
        const testClassName = 'custom-test-class';
        const { container } = render(<IconComponent className={testClassName} />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveClass(testClassName);
      }
    );

    /**
     * Tests that each icon works with undefined className
     * Validates: Requirement 1.2
     */
    it.each(iconComponents)(
      '%s renders correctly without className',
      (name, IconComponent) => {
        const { container } = render(<IconComponent />);
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
      }
    );

    /**
     * Tests that each icon works with empty string className
     */
    it.each(iconComponents)(
      '%s handles empty string className',
      (name, IconComponent) => {
        const { container } = render(<IconComponent className="" />);
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
      }
    );

    /**
     * Tests that multiple classes can be applied
     */
    it.each(iconComponents)(
      '%s accepts multiple classes in className',
      (name, IconComponent) => {
        const testClasses = 'class-one class-two class-three';
        const { container } = render(<IconComponent className={testClasses} />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('class-one');
        expect(svg).toHaveClass('class-two');
        expect(svg).toHaveClass('class-three');
      }
    );
  });

  describe('Accessibility (aria-hidden)', () => {
    /**
     * Tests that each icon has aria-hidden="true" attribute
     * Validates: Requirement 1.3
     */
    it.each(iconComponents)(
      '%s has aria-hidden="true" attribute',
      (name, IconComponent) => {
        const { container } = render(<IconComponent />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('aria-hidden', 'true');
      }
    );
  });

  describe('SVG Attributes', () => {
    /**
     * Tests that each icon has standardized viewBox
     */
    it.each(iconComponents)(
      '%s has viewBox="0 0 24 24"',
      (name, IconComponent) => {
        const { container } = render(<IconComponent />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      }
    );

    /**
     * Tests that each icon uses currentColor for stroke
     */
    it.each(iconComponents)(
      '%s uses currentColor for stroke',
      (name, IconComponent) => {
        const { container } = render(<IconComponent />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('stroke', 'currentColor');
      }
    );

    /**
     * Tests that each icon has fill="none"
     */
    it.each(iconComponents)(
      '%s has fill="none"',
      (name, IconComponent) => {
        const { container } = render(<IconComponent />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('fill', 'none');
      }
    );

    /**
     * Tests that each icon has consistent strokeWidth
     */
    it.each(iconComponents)(
      '%s has strokeWidth of 2',
      (name, IconComponent) => {
        const { container } = render(<IconComponent />);
        const svg = container.querySelector('svg');
        // strokeWidth might be "2" or 2, so we check both
        const strokeWidth = svg?.getAttribute('stroke-width');
        expect(strokeWidth).toBe('2');
      }
    );

    /**
     * Tests that each icon has xmlns attribute for compatibility
     */
    it.each(iconComponents)(
      '%s has xmlns attribute',
      (name, IconComponent) => {
        const { container } = render(<IconComponent />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
      }
    );
  });
});
