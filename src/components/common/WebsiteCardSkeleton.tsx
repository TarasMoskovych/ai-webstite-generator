/**
 * WebsiteCardSkeleton component
 * Renders an animated skeleton placeholder matching WebsiteCard dimensions
 *
 * Requirements:
 * - 11.3: Create WebsiteCardSkeleton component file at src/components/common/WebsiteCardSkeleton.tsx
 * - 11.4: Render animated skeleton placeholder matching WebsiteCard dimensions
 */

/**
 * WebsiteCardSkeleton component
 * Displays a loading skeleton with animated pulse effect for website cards
 * No props required - purely presentational
 */
export function WebsiteCardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Thumbnail skeleton - matches aspect-video ratio of WebsiteCard */}
      <div className="aspect-video bg-muted rounded-lg" />
      {/* Text content skeleton - matches spacing of WebsiteCard */}
      <div className="mt-3 space-y-2">
        {/* Title skeleton */}
        <div className="h-4 bg-muted rounded w-3/4" />
        {/* Creator name skeleton */}
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}
