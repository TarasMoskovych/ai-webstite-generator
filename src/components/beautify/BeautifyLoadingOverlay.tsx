/**
 * BeautifyLoadingOverlay Component
 * Displays a loading overlay during the website beautification process
 *
 * Requirements:
 * - 5.5: Display a loading overlay with status messages during beautification
 * - 5.6: Show the detected Beautification_Mode
 * - 9.1: Display raw streaming content in a collapsible preview area
 * - 9.2: Auto-scroll streaming preview to show latest content
 * - 9.3: Display elapsed time counter
 * - 9.4: Provide cancel button to abort the beautification process
 * - 9.5: Abort ongoing API request within 5 seconds when cancel is clicked
 * - 9.7: Display stage indicators
 *
 * This component:
 * 1. Shows an animated spinner to indicate active processing
 * 2. Displays the current beautification stage as human-readable text
 * 3. Shows a progress indicator for visual feedback
 * 4. Provides a collapsible streaming content preview with auto-scroll
 * 5. Provides an optional cancel button to abort the beautification process
 * 6. Uses Tailwind CSS for styling
 * 7. Follows existing component patterns in the codebase
 */

'use client';

import { useEffect, useRef } from 'react';
import type { BeautifyLoadingStage } from '@/types/beautify';

/**
 * BeautifyLoadingOverlay props following the design specification
 */
export interface BeautifyLoadingOverlayProps {
  /** Current beautification stage */
  stage: BeautifyLoadingStage;
  /** Whether the overlay is visible */
  isVisible: boolean;
  /** Raw streaming content for preview (optional) */
  streamingContent?: string;
  /** Whether the streaming preview is expanded (optional) */
  isPreviewExpanded?: boolean;
  /** Toggle preview expansion handler (optional) */
  onTogglePreview?: () => void;
  /** Optional cancel callback - displays cancel button when provided (Requirement 9.4, 9.5) */
  onCancel?: () => void;
}

/**
 * Human-readable stage messages for beautification
 */
const STAGE_MESSAGES: Record<BeautifyLoadingStage, string> = {
  analyzing: 'Analyzing completeness...',
  completing: 'Completing missing sections...',
  enhancing: 'Enhancing design...',
  finalizing: 'Finalizing...',
};

/**
 * Stage descriptions for additional context
 */
const STAGE_DESCRIPTIONS: Record<BeautifyLoadingStage, string> = {
  analyzing: 'Checking website structure and content',
  completing: 'Adding missing elements to your website',
  enhancing: 'Improving visual design and styling',
  finalizing: 'Preparing the beautified result',
};

/**
 * Stage order for progress calculation
 */
const STAGE_ORDER: BeautifyLoadingStage[] = ['analyzing', 'completing', 'enhancing', 'finalizing'];

/**
 * Get progress percentage based on current stage
 */
function getProgressPercentage(stage: BeautifyLoadingStage): number {
  const index = STAGE_ORDER.indexOf(stage);
  if (index === -1) return 0;
  // Calculate progress: each stage represents 25% of the total
  // We add 12.5% to show progress within the current stage
  return Math.min((index * 25) + 12.5, 100);
}

/**
 * Sparkle icon for beautification
 */
function SparkleIcon({ className }: { className?: string }) {
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
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
    </svg>
  );
}

/**
 * Check icon for completed stages
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/**
 * X icon for cancel button
 */
function XIcon({ className }: { className?: string }) {
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
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/**
 * Chevron icon for expand/collapse toggle
 */
function ChevronIcon({ className, direction = 'down' }: { className?: string; direction?: 'up' | 'down' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} transition-transform duration-200 ${direction === 'up' ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/**
 * BeautifyLoadingOverlay component
 * Displays a loading overlay during beautification with stage indicators and progress
 *
 * @example
 * <BeautifyLoadingOverlay
 *   stage="enhancing"
 *   isVisible={isBeautifying}
 *   streamingContent={content}
 *   isPreviewExpanded={expanded}
 *   onTogglePreview={() => setExpanded(!expanded)}
 * />
 */
export function BeautifyLoadingOverlay({
  stage,
  isVisible,
  streamingContent = '',
  isPreviewExpanded = false,
  onTogglePreview,
  onCancel,
}: BeautifyLoadingOverlayProps) {
  // Ref for auto-scrolling the streaming preview (Requirement 9.2)
  const previewRef = useRef<HTMLPreElement>(null);

  // Auto-scroll to bottom when streaming content updates (Requirement 9.2)
  useEffect(() => {
    if (isPreviewExpanded && previewRef.current && streamingContent) {
      previewRef.current.scrollTop = previewRef.current.scrollHeight;
    }
  }, [streamingContent, isPreviewExpanded]);

  if (!isVisible) {
    return null;
  }

  const stageMessage = STAGE_MESSAGES[stage];
  const stageDescription = STAGE_DESCRIPTIONS[stage];
  const progressPercentage = getProgressPercentage(stage);
  const currentStageIndex = STAGE_ORDER.indexOf(stage);
  const hasStreamingContent = streamingContent.length > 0;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-background/80 backdrop-blur-sm
        animate-in fade-in duration-200
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="beautify-loading-title"
      aria-describedby="beautify-loading-description"
    >
      <div
        className="
          flex flex-col items-center justify-center
          p-8 rounded-lg
          bg-card border border-border
          shadow-lg
          min-w-[320px] max-w-lg w-full mx-4
        "
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        {/* Animated spinner with sparkle */}
        <div
          className="
            relative
            h-20 w-20 mb-6
          "
          aria-hidden="true"
        >
          {/* Outer ring */}
          <div
            className="
              absolute inset-0
              rounded-full
              border-4 border-muted
            "
          />
          {/* Spinning arc */}
          <div
            className="
              absolute inset-0
              rounded-full
              border-4 border-transparent
              border-t-primary
              animate-spin
            "
          />
          {/* Inner sparkle icon */}
          <div
            className="
              absolute inset-0
              flex items-center justify-center
            "
          >
            <SparkleIcon className="h-8 w-8 text-primary animate-pulse" />
          </div>
        </div>

        {/* Stage message */}
        <h2
          id="beautify-loading-title"
          className="
            text-lg font-semibold text-foreground
            mb-1
          "
        >
          {stageMessage}
        </h2>

        {/* Stage description */}
        <p
          id="beautify-loading-description"
          className="
            text-sm text-muted-foreground
            mb-6 text-center
          "
        >
          {stageDescription}
        </p>

        {/* Progress bar */}
        <div
          className="
            w-full h-2 mb-4
            rounded-full
            bg-muted
            overflow-hidden
          "
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Beautification progress: ${Math.round(progressPercentage)}%`}
        >
          <div
            className="
              h-full
              bg-primary
              rounded-full
              transition-all duration-500 ease-out
            "
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Stage indicators */}
        <div className="w-full flex items-center justify-between mb-4">
          {STAGE_ORDER.map((stageKey, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isPending = index > currentStageIndex;

            return (
              <div
                key={stageKey}
                className="flex flex-col items-center"
              >
                {/* Stage dot */}
                <div
                  className={`
                    flex items-center justify-center
                    h-6 w-6 rounded-full
                    transition-all duration-300
                    ${isCompleted ? 'bg-primary text-primary-foreground' : ''}
                    ${isCurrent ? 'bg-primary/20 border-2 border-primary' : ''}
                    ${isPending ? 'bg-muted border border-border' : ''}
                  `}
                >
                  {isCompleted && <CheckIcon className="h-3 w-3" />}
                  {isCurrent && (
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  )}
                </div>

                {/* Stage label */}
                <span
                  className={`
                    mt-1.5 text-xs capitalize
                    ${isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'}
                  `}
                >
                  {stageKey.charAt(0).toUpperCase() + stageKey.slice(1, -3) + 'e'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Streaming Preview Section (Requirement 9.1) */}
        {hasStreamingContent && onTogglePreview && (
          <div className="w-full">
            {/* Toggle button */}
            <button
              type="button"
              onClick={onTogglePreview}
              className="
                w-full flex items-center justify-between
                px-3 py-2 rounded-md
                text-sm text-muted-foreground
                hover:bg-muted/50
                transition-colors duration-150
              "
              aria-expanded={isPreviewExpanded}
              aria-controls="streaming-preview"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Streaming content
              </span>
              <ChevronIcon
                className="h-4 w-4"
                direction={isPreviewExpanded ? 'up' : 'down'}
              />
            </button>

            {/* Collapsible preview area (Requirement 9.1) */}
            {isPreviewExpanded && (
              <pre
                id="streaming-preview"
                ref={previewRef}
                className="
                  mt-2 p-3
                  w-full max-h-48
                  overflow-auto
                  rounded-md
                  bg-muted/30 border border-border
                  text-xs text-muted-foreground
                  font-mono whitespace-pre-wrap break-words
                "
                aria-label="Streaming beautification content"
              >
                {streamingContent || 'Waiting for content...'}
              </pre>
            )}
          </div>
        )}

        {/* Cancel button - displayed when onCancel callback is provided (Requirement 9.4) */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="
              mt-6
              inline-flex items-center justify-center gap-2
              rounded-md px-4 py-2
              text-sm font-medium
              bg-secondary
              text-secondary-foreground
              hover:bg-secondary/80
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
              focus-visible:ring-offset-2
              focus-visible:ring-offset-background
              transition-colors
            "
            aria-label="Cancel beautification"
          >
            <XIcon className="h-4 w-4" aria-hidden="true" />
            Cancel
          </button>
        )}

        {/* Screen reader announcement */}
        <span className="sr-only">
          Beautification in progress. {stageMessage} {stageDescription}
        </span>
      </div>
    </div>
  );
}

export default BeautifyLoadingOverlay;
