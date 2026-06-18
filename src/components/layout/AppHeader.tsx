/**
 * AppHeader Component
 * Application header with user profile, theme toggle, and sign out functionality
 *
 * Requirements:
 * - 15.1: Display user's Google profile picture and display name
 * - 15.2: Display sign out button accessible from any protected page
 * - 15.4: Display default avatar with user's initial if profile picture unavailable
 *
 * This component:
 * 1. Displays app logo/name on the left
 * 2. Shows user profile section on the right with avatar, name, theme toggle, and sign out
 * 3. Uses accessible navigation with proper landmarks
 * 4. Handles missing profile pictures with a default avatar showing user initials
 */

'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/components/auth';
import { ThemeToggle } from './ThemeToggle';
import { AuthenticatedUser } from '@/types';

/**
 * AppHeader props
 */
export interface AppHeaderProps {
  /** Optional user override (defaults to useAuth user) */
  user?: AuthenticatedUser | null;
}

/**
 * LogOut icon
 */
function LogOutIcon({ className }: { className?: string }) {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

/**
 * Sparkles icon for the logo
 */
function SparklesIcon({ className }: { className?: string }) {
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
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

/**
 * Get initials from display name for default avatar
 */
function getInitials(displayName: string): string {
  const names = displayName.trim().split(/\s+/);
  if (names.length === 0 || !names[0]) {
    return '?';
  }
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

/**
 * Default avatar component showing user initials
 */
function DefaultAvatar({
  displayName,
  className,
}: {
  displayName: string;
  className?: string;
}) {
  const initials = getInitials(displayName);

  return (
    <div
      className={`
        flex items-center justify-center
        rounded-full
        bg-primary text-primary-foreground
        font-semibold text-sm
        ${className ?? ''}
      `}
      aria-label={`Avatar for ${displayName}`}
    >
      {initials}
    </div>
  );
}

/**
 * User avatar component with fallback to default
 */
function UserAvatar({
  user,
  className,
}: {
  user: AuthenticatedUser;
  className?: string;
}) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  if (!user.photoURL || imageError) {
    return <DefaultAvatar displayName={user.displayName} className={className} />;
  }

  return (
    <Image
      src={user.photoURL}
      alt={`${user.displayName}'s profile picture`}
      width={32}
      height={32}
      className={`rounded-full object-cover ${className ?? ''}`}
      onError={handleImageError}
      referrerPolicy="no-referrer"
      unoptimized // Google profile images are already optimized and have strict CORS
    />
  );
}

/**
 * AppHeader component
 * Main application header with navigation and user controls
 */
export function AppHeader({ user: userProp }: AppHeaderProps) {
  const { user: authUser, signOut, loading } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  // Use provided user or fall back to auth context user
  const user = userProp ?? authUser;

  const handleSignOut = useCallback(async () => {
    if (signingOut) return;

    try {
      setSigningOut(true);
      await signOut();
    } catch (error) {
      // Error is already handled by AuthProvider
      console.error('Sign out failed:', error);
    } finally {
      setSigningOut(false);
    }
  }, [signOut, signingOut]);

  return (
    <header
      className="
        sticky top-0 z-50
        border-b border-border
        bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
      "
      role="banner"
    >
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo and app name */}
        <div className="flex items-center gap-2">
          <a
            href="/dashboard"
            className="
              flex items-center gap-2
              text-foreground
              hover:text-primary
              transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
              rounded-sm
            "
            aria-label="AI Website Generator - Go to dashboard"
          >
            <SparklesIcon className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg hidden sm:inline">
              AI Website Generator
            </span>
            <span className="font-semibold text-lg sm:hidden">AI Gen</span>
          </a>
        </div>

        {/* User profile section */}
        <nav
          className="flex items-center gap-2 sm:gap-4"
          aria-label="User navigation"
        >
          {/* Theme toggle */}
          <ThemeToggle />

          {/* User info and sign out */}
          {user && !loading && (
            <>
              {/* User avatar and name */}
              <div className="flex items-center gap-2">
                <UserAvatar user={user} className="h-8 w-8" />
                <span
                  className="
                    text-sm font-medium text-foreground
                    hidden md:inline
                    max-w-[150px] truncate
                  "
                  title={user.displayName}
                >
                  {user.displayName}
                </span>
              </div>

              {/* Sign out button */}
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="
                  inline-flex items-center justify-center gap-2
                  rounded-md px-3 py-2
                  text-sm font-medium
                  text-muted-foreground
                  hover:bg-accent hover:text-accent-foreground
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                  disabled:pointer-events-none disabled:opacity-50
                  transition-colors
                "
                aria-label="Sign out"
              >
                <LogOutIcon className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {signingOut ? 'Signing out...' : 'Sign out'}
                </span>
              </button>
            </>
          )}

          {/* Loading state */}
          {loading && (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          )}
        </nav>
      </div>
    </header>
  );
}

export default AppHeader;
