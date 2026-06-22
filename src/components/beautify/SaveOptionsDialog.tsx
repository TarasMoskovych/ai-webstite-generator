/**
 * SaveOptionsDialog Component
 * A dialog for choosing how to save beautified website content.
 *
 * Requirements:
 * - 8.1: Display a save options dialog when user accepts beautified changes
 * - 8.2: Provide two options: "Replace Original" and "Save as New"
 * - 8.3: Update existing website document when "Replace Original" is selected
 * - 8.5: Append " (Beautified)" to title when "Save as New" is selected
 * - 8.7: Display a success confirmation message when save completes
 * - 8.8: Display an error message and allow retry if save fails
 *
 * This component:
 * 1. Displays a modal dialog with save options after beautification
 * 2. Shows "Keep Changes" (Replace Original) and "Save as New Version" options
 * 3. Includes "Revert to Original" option to discard beautified version
 * 4. Provides clear labeling and confirmation messaging
 * 5. Handles loading states during save operations
 * 6. Shows success confirmation on successful save
 * 7. Shows error message with retry option on failure
 * 8. Accessible with proper ARIA attributes and keyboard navigation
 * 9. Supports dark mode with WCAG AA compliant colors
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * SaveOptionsDialog props following the design specification
 */
export interface SaveOptionsDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Original website title */
  originalTitle: string;
  /** Close handler (called on revert/cancel) */
  onClose: () => void;
  /** Handler when user chooses to replace original */
  onReplaceOriginal: () => Promise<void>;
  /** Handler when user chooses to save as new */
  onSaveAsNew: () => Promise<void>;
}

/**
 * Save operation state
 */
type SaveState = 'idle' | 'saving' | 'success' | 'error';

/**
 * Save option type
 */
type SaveOption = 'replace' | 'new' | null;

/**
 * Sparkle icon for beautify action
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
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

/**
 * Check icon for success state
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
 * X icon for close and error
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
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/**
 * Save/Replace icon
 */
function SaveIcon({ className }: { className?: string }) {
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
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17,21 17,13 7,13 7,21" />
      <polyline points="7,3 7,8 15,8" />
    </svg>
  );
}

/**
 * Copy/Duplicate icon for save as new
 */
function CopyIcon({ className }: { className?: string }) {
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
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

/**
 * Undo/Revert icon
 */
function UndoIcon({ className }: { className?: string }) {
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
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}

/**
 * Alert/Warning icon for error state
 */
function AlertIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

/**
 * Spinner icon for loading state
 */
function SpinnerIcon({ className }: { className?: string }) {
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
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

/**
 * SaveOptionsDialog component
 * Displays a dialog for choosing how to save beautified content
 *
 * @example
 * <SaveOptionsDialog
 *   isOpen={showSaveDialog}
 *   originalTitle="My Website"
 *   onClose={() => setShowSaveDialog(false)}
 *   onReplaceOriginal={handleReplaceOriginal}
 *   onSaveAsNew={handleSaveAsNew}
 * />
 */
export function SaveOptionsDialog({
  isOpen,
  originalTitle,
  onClose,
  onReplaceOriginal,
  onSaveAsNew,
}: SaveOptionsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [selectedOption, setSelectedOption] = useState<SaveOption>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Reset state when dialog closes
   */
  useEffect(() => {
    if (!isOpen) {
      const resetTimeout = setTimeout(() => {
        setSaveState('idle');
        setSelectedOption(null);
        setErrorMessage(null);
      }, 200);
      return () => clearTimeout(resetTimeout);
    }
  }, [isOpen]);

  /**
   * Handle close (called on revert or cancel)
   */
  const handleClose = useCallback(() => {
    if (saveState !== 'saving') {
      onClose();
    }
  }, [onClose, saveState]);

  /**
   * Handle backdrop click
   */
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget && saveState !== 'saving') {
        onClose();
      }
    },
    [onClose, saveState]
  );

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && saveState !== 'saving') {
        event.preventDefault();
        onClose();
      }
    },
    [onClose, saveState]
  );

  /**
   * Focus management and keyboard event setup
   */
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, handleKeyDown]);

  /**
   * Handle replace original action
   */
  const handleReplaceOriginal = useCallback(async () => {
    setSaveState('saving');
    setSelectedOption('replace');
    setErrorMessage(null);

    try {
      await onReplaceOriginal();
      setSaveState('success');
    } catch (error) {
      setSaveState('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to save changes. Please try again.'
      );
    }
  }, [onReplaceOriginal]);

  /**
   * Handle save as new action
   */
  const handleSaveAsNew = useCallback(async () => {
    setSaveState('saving');
    setSelectedOption('new');
    setErrorMessage(null);

    try {
      await onSaveAsNew();
      setSaveState('success');
    } catch (error) {
      setSaveState('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to save as new website. Please try again.'
      );
    }
  }, [onSaveAsNew]);

  /**
   * Handle retry after error
   */
  const handleRetry = useCallback(() => {
    if (selectedOption === 'replace') {
      handleReplaceOriginal();
    } else if (selectedOption === 'new') {
      handleSaveAsNew();
    }
  }, [selectedOption, handleReplaceOriginal, handleSaveAsNew]);

  /**
   * Auto-close dialog after success (with delay for user feedback)
   */
  useEffect(() => {
    if (saveState === 'success') {
      const successTimeout = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(successTimeout);
    }
  }, [saveState, onClose]);

  // Don't render anything if dialog is not open
  if (!isOpen) {
    return null;
  }

  // Calculate new title for "Save as New" option
  const newTitle = `${originalTitle} (Beautified)`;

  const isSaving = saveState === 'saving';
  const isSuccess = saveState === 'success';
  const isError = saveState === 'error';

  // Render dialog using portal
  return createPortal(
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        p-4
      "
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="
          absolute inset-0
          bg-black/50
          dark:bg-black/70
          animate-in fade-in duration-200
        "
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-options-dialog-title"
        aria-describedby="save-options-dialog-description"
        className="
          relative z-10
          w-full max-w-md
          rounded-lg border
          border-border
          bg-card
          shadow-lg
          animate-in fade-in zoom-in-95 duration-200
          overflow-hidden
        "
      >
        {/* Success State */}
        {isSuccess && (
          <div className="p-8 text-center">
            <div
              className="
                mx-auto mb-4
                flex h-16 w-16 items-center justify-center
                rounded-full
                bg-green-100 dark:bg-green-900/30
              "
            >
              <CheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {selectedOption === 'replace' ? 'Changes Saved!' : 'Website Created!'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedOption === 'replace'
                ? 'Your beautified changes have been saved successfully.'
                : `"${newTitle}" has been created successfully.`}
            </p>
          </div>
        )}

        {/* Normal State (idle, saving, or error) */}
        {!isSuccess && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex-shrink-0
                    rounded-full
                    bg-primary/10
                    p-2
                    dark:bg-primary/20
                  "
                >
                  <SparkleIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2
                    id="save-options-dialog-title"
                    className="text-lg font-semibold text-foreground"
                  >
                    Save Beautified Website
                  </h2>
                  <p
                    id="save-options-dialog-description"
                    className="text-sm text-muted-foreground"
                  >
                    Choose how to save your changes
                  </p>
                </div>
              </div>

              {/* Close button */}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleClose}
                disabled={isSaving}
                className="
                  p-2 rounded-md
                  text-muted-foreground
                  hover:text-foreground hover:bg-muted
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-ring focus-visible:ring-offset-2
                  transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                aria-label="Close dialog"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Error message */}
              {isError && errorMessage && (
                <div
                  className="
                    flex items-start gap-3
                    p-3 rounded-md
                    bg-destructive/10 border border-destructive/30
                    text-destructive
                  "
                  role="alert"
                >
                  <AlertIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Save Failed</p>
                    <p className="text-sm opacity-90 mt-0.5">{errorMessage}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="
                      px-3 py-1 rounded-md
                      text-xs font-medium
                      bg-destructive/20 hover:bg-destructive/30
                      transition-colors
                    "
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Keep Changes (Replace Original) option */}
              <button
                type="button"
                onClick={handleReplaceOriginal}
                disabled={isSaving}
                className="
                  w-full flex items-start gap-4 p-4
                  rounded-lg border border-border
                  text-left
                  transition-all
                  hover:border-primary/50 hover:bg-muted/50
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-ring focus-visible:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <div className="flex-shrink-0 p-2 rounded-md bg-primary/10 text-primary">
                  {isSaving && selectedOption === 'replace' ? (
                    <SpinnerIcon className="h-6 w-6 animate-spin" />
                  ) : (
                    <SaveIcon className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Keep Changes</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Replace the original website with your beautified version
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    &quot;{originalTitle}&quot; will be updated
                  </p>
                </div>
              </button>

              {/* Save as New Version option */}
              <button
                type="button"
                onClick={handleSaveAsNew}
                disabled={isSaving}
                className="
                  w-full flex items-start gap-4 p-4
                  rounded-lg border border-border
                  text-left
                  transition-all
                  hover:border-primary/50 hover:bg-muted/50
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-ring focus-visible:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <div className="flex-shrink-0 p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  {isSaving && selectedOption === 'new' ? (
                    <SpinnerIcon className="h-6 w-6 animate-spin" />
                  ) : (
                    <CopyIcon className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Save as New Version</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Create a new website with the beautified design
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    New website: &quot;{newTitle}&quot;
                  </p>
                </div>
              </button>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-2 text-xs text-muted-foreground">or</span>
                </div>
              </div>

              {/* Revert to Original option */}
              <button
                type="button"
                onClick={handleClose}
                disabled={isSaving}
                className="
                  w-full flex items-center justify-center gap-2 p-3
                  rounded-lg border border-border
                  text-sm font-medium text-muted-foreground
                  transition-all
                  hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-ring focus-visible:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <UndoIcon className="h-4 w-4" />
                Revert to Original
              </button>
            </div>

            {/* Footer note */}
            <div className="px-4 pb-4">
              <p className="text-xs text-muted-foreground text-center">
                {selectedOption === 'replace'
                  ? 'This will overwrite your original website.'
                  : selectedOption === 'new'
                    ? 'Your original website will be preserved.'
                    : 'Choose an option above to continue.'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

export default SaveOptionsDialog;
