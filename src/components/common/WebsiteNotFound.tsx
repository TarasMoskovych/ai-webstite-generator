'use client';

import { useRouter } from 'next/navigation';

/**
 * WebsiteNotFound component props
 */
export interface WebsiteNotFoundProps {
  /** Optional callback for custom navigation handling */
  onNavigateBack?: () => void;
}

/**
 * WebsiteNotFound component
 * Displays a not-found state with navigation back to dashboard
 *
 * @remarks
 * - Uses Next.js `useRouter` internally for default navigation to `/dashboard`
 * - Custom callback takes precedence when provided
 * - Maintains exact visual appearance of original inline implementation
 * - Icon uses muted background with X symbol SVG
 *
 * Requirements:
 * - 2.1: Create WebsiteNotFound component file at src/components/common/WebsiteNotFound.tsx
 * - 2.2: Accept optional onNavigateBack callback prop for custom navigation
 * - 2.3: Render icon, heading, description, and navigation button
 * - 2.4: Export WebsiteNotFoundProps interface
 */
export function WebsiteNotFound({
  onNavigateBack,
}: WebsiteNotFoundProps) {
  const router = useRouter();

  const handleNavigate = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 px-4">
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full bg-muted"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-12 w-12 text-muted-foreground"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6" />
          <path d="m9 9 6 6" />
        </svg>
      </div>

      <div className="text-center max-w-md">
        <h2 className="text-xl font-semibold text-foreground">
          Website not found
        </h2>
        <p className="text-muted-foreground text-sm mt-2">
          The website you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
        </p>
      </div>

      <button
        type="button"
        onClick={handleNavigate}
        className="
          inline-flex items-center justify-center gap-2
          rounded-md bg-primary px-6 py-3
          text-base font-medium text-primary-foreground
          hover:bg-primary/90
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
          focus-visible:ring-offset-2 focus-visible:ring-offset-background
          transition-colors
        "
      >
        Back to Dashboard
      </button>
    </div>
  );
}
