/**
 * ThemeToggle Component
 * A toggle button for switching between light/dark/system themes
 *
 * Requirements:
 * - 19.2: Provide theme toggle button in header to switch between light/dark themes
 * - 19.3: Persist theme preference and apply on subsequent visits
 *
 * This component:
 * 1. Displays a button with appropriate icon (sun/moon/system)
 * 2. Cycles through light → dark → system themes on click
 * 3. Shows dropdown menu for direct theme selection
 * 4. Uses the useTheme hook from ThemeProvider
 * 5. Styled with Tailwind CSS for both light and dark modes
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme, Theme } from './ThemeProvider';

/**
 * Sun icon for light theme
 */
function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

/**
 * Moon icon for dark theme
 */
function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

/**
 * Monitor icon for system theme
 */
function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}

/**
 * Check icon for selected option
 */
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/**
 * Theme option configuration
 */
interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Available theme options
 */
const themeOptions: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
];

/**
 * Get the icon component for the current theme
 */
function getThemeIcon(theme: Theme): React.ComponentType<{ className?: string }> {
  const option = themeOptions.find((opt) => opt.value === theme);
  return option?.icon ?? MonitorIcon;
}

/**
 * Get the label for the current theme
 */
function getThemeLabel(theme: Theme): string {
  const option = themeOptions.find((opt) => opt.value === theme);
  return option?.label ?? 'System';
}

/**
 * ThemeToggle props
 */
export interface ThemeToggleProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * ThemeToggle component
 * Displays a button to toggle between light/dark/system themes
 * with a dropdown menu for direct selection
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Get the current theme icon
  const CurrentIcon = getThemeIcon(theme);

  /**
   * Toggle dropdown menu
   */
  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  /**
   * Close dropdown menu
   */
  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Handle theme selection
   */
  const handleThemeSelect = useCallback(
    (newTheme: Theme) => {
      setTheme(newTheme);
      closeMenu();
      // Return focus to the toggle button
      buttonRef.current?.focus();
    },
    [setTheme, closeMenu]
  );

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) {
        // Open menu on Enter, Space, ArrowDown, or ArrowUp
        if (
          event.key === 'Enter' ||
          event.key === ' ' ||
          event.key === 'ArrowDown' ||
          event.key === 'ArrowUp'
        ) {
          event.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      // Menu is open
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          closeMenu();
          buttonRef.current?.focus();
          break;
        case 'ArrowDown': {
          event.preventDefault();
          const currentIndex = themeOptions.findIndex((opt) => opt.value === theme);
          const nextIndex = (currentIndex + 1) % themeOptions.length;
          handleThemeSelect(themeOptions[nextIndex].value);
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          const currentIndex = themeOptions.findIndex((opt) => opt.value === theme);
          const prevIndex =
            (currentIndex - 1 + themeOptions.length) % themeOptions.length;
          handleThemeSelect(themeOptions[prevIndex].value);
          break;
        }
        case 'Tab':
          closeMenu();
          break;
      }
    },
    [isOpen, theme, closeMenu, handleThemeSelect]
  );

  /**
   * Close menu when clicking outside
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeMenu]);

  /**
   * Close menu on focus loss
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleFocusOut = (event: FocusEvent) => {
      const relatedTarget = event.relatedTarget as Node | null;
      if (
        menuRef.current &&
        !menuRef.current.contains(relatedTarget) &&
        buttonRef.current &&
        !buttonRef.current.contains(relatedTarget)
      ) {
        closeMenu();
      }
    };

    const container = menuRef.current?.parentElement;
    container?.addEventListener('focusout', handleFocusOut);
    return () => {
      container?.removeEventListener('focusout', handleFocusOut);
    };
  }, [isOpen, closeMenu]);

  return (
    <div className={`relative ${className ?? ''}`}>
      {/* Toggle button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Theme: ${getThemeLabel(theme)}. Click to change theme.`}
        className="
          inline-flex items-center justify-center
          rounded-md p-2
          text-muted-foreground
          hover:bg-accent hover:text-accent-foreground
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
          transition-colors
        "
      >
        <CurrentIcon className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="listbox"
          aria-label="Select theme"
          className="
            absolute right-0 top-full mt-1
            z-[100] min-w-[8rem]
            rounded-md border border-border
            bg-popover p-1
            text-popover-foreground
            shadow-md
            animate-in fade-in-0 zoom-in-95
          "
        >
          {themeOptions.map((option) => {
            const OptionIcon = option.icon;
            const isSelected = theme === option.value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleThemeSelect(option.value)}
                className={`
                  relative flex w-full cursor-pointer select-none items-center
                  rounded-sm px-2 py-1.5
                  text-sm outline-none
                  transition-colors
                  ${
                    isSelected
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }
                  focus-visible:bg-accent focus-visible:text-accent-foreground
                `}
              >
                <OptionIcon className="mr-2 h-4 w-4" />
                <span className="flex-1 text-left">{option.label}</span>
                {isSelected && <CheckIcon className="ml-2 h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;
