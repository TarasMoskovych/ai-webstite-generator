/**
 * LoadingSpinner component
 * Displays a centered spinning indicator with optional message
 *
 * Requirements:
 * - 1.1: Component file at src/components/common/LoadingSpinner.tsx
 * - 1.2: Accept optional message prop (max 100 chars, default "Loading...")
 * - 1.3: Render 40x40px spinner with primary color theme and message below
 * - 1.4: Accept optional fullScreen prop for viewport height control
 */

/**
 * LoadingSpinner component props
 */
export interface LoadingSpinnerProps {
  /** Optional loading message (max 100 characters, defaults to "Loading...") */
  message?: string;
  /** Whether to render at full viewport height (defaults to false) */
  fullScreen?: boolean;
}

/**
 * LoadingSpinner component
 * Displays a centered spinning indicator with optional message
 */
export function LoadingSpinner({
  message = 'Loading...',
  fullScreen = false,
}: LoadingSpinnerProps) {
  // Truncate message to max 100 characters to prevent layout issues
  const displayMessage = message.slice(0, 100);

  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? 'min-h-screen' : 'min-h-[400px]'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">{displayMessage}</p>
      </div>
    </div>
  );
}
