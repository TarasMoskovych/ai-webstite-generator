/**
 * Website Preview Page Integration Tests
 *
 * Tests that verify the Website Preview page works correctly with:
 * - Auth integration (getIdToken from useAuth hook)
 * - Icons from shared Icons module
 * - Preview functionality
 * - Loading and error states
 *
 * Validates: Requirements 11.1, 11.2, 11.4, 13.1
 */

import React, { Suspense } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import type { GeneratedWebsite } from '@/types/website';

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/website/test-website-123',
}));

// Mock user
const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
};

// Mock getIdToken function
const mockGetIdToken = vi.fn();

// Mock the auth context
vi.mock('@/components/auth', () => ({
  useAuth: () => ({
    user: mockUser,
    isLoading: false,
    loading: false,
    error: null,
    signOut: vi.fn(),
    getIdToken: mockGetIdToken,
  }),
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the ThemeToggle component to avoid needing ThemeProvider
vi.mock('@/components/layout/ThemeToggle', () => ({
  ThemeToggle: () => <button aria-label="Toggle theme">Theme</button>,
}));

// Mock the ThemeProvider and useTheme to avoid theme context issues
vi.mock('@/components/layout/ThemeProvider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    resolvedTheme: 'light',
  }),
}));

// Mock website repository
const mockGetById = vi.fn();
const mockUpdate = vi.fn();
const mockToggleShowcase = vi.fn();

vi.mock('@/services/websiteRepository', () => ({
  default: {
    getById: (...args: unknown[]) => mockGetById(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    toggleShowcase: (...args: unknown[]) => mockToggleShowcase(...args),
    save: vi.fn(),
  },
}));

// Mock download service
vi.mock('@/services/downloadService', () => ({
  generateSingleFile: vi.fn().mockResolvedValue(new Blob(['<html></html>'])),
  generateZipArchive: vi.fn().mockResolvedValue(new Blob(['zip content'])),
  downloadBlob: vi.fn(),
}));

// Mock HTML sanitizer
vi.mock('@/services/htmlSanitizer', () => ({
  sanitize: (html: string) => html,
}));

// Mock beautify errors
vi.mock('@/lib/beautifyErrors', () => ({
  getBeautifyError: (err: Error | string) => ({
    title: 'Beautification Error',
    message: typeof err === 'string' ? err : err.message,
    isRetryable: true,
  }),
}));

// Mock Monaco Editor to prevent hanging
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: { value?: string; onChange?: (val: string | undefined) => void }) => (
    <textarea
      data-testid="mock-monaco-editor"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

// Mock the CodeEditor component entirely for faster tests
vi.mock('@/components/CodeEditor', () => ({
  CodeEditor: ({ html, css, activeTab, onTabChange }: {
    html: string;
    css: string;
    onHtmlChange: (val: string) => void;
    onCssChange: (val: string) => void;
    activeTab: 'html' | 'css';
    onTabChange: (tab: 'html' | 'css') => void;
  }) => (
    <div data-testid="mock-code-editor">
      <button onClick={() => onTabChange('html')}>HTML</button>
      <button onClick={() => onTabChange('css')}>CSS</button>
      <div data-testid="editor-content">{activeTab === 'html' ? html : css}</div>
    </div>
  ),
}));

// Mock useBeautifySave hook
vi.mock('@/hooks/useBeautifySave', () => ({
  useBeautifySave: () => ({
    handleReplaceOriginal: vi.fn(),
    handleSaveAsNew: vi.fn(),
  }),
}));

// Mock useBeautifyWorkflow hook to prevent SSE/streaming issues
const mockOpenOptionsDialog = vi.fn();
const mockStartBeautify = vi.fn();
const mockCancelBeautify = vi.fn();
const mockHandleConfirm = vi.fn();
const mockHandleAccept = vi.fn();
const mockHandleReject = vi.fn();
const mockHandleRetry = vi.fn();
const mockHandleDismiss = vi.fn();

vi.mock('@/hooks/useBeautifyWorkflow', () => ({
  useBeautifyWorkflow: () => ({
    isBeautifying: false,
    beautifyStage: null,
    streamingContent: '',
    beautifiedHtml: '',
    beautifiedCss: '',
    beautifyError: null,
    showBeautifyOptions: false,
    showPreviewComparison: false,
    showSaveOptions: false,
    openOptionsDialog: mockOpenOptionsDialog,
    startBeautify: mockStartBeautify,
    cancelBeautify: mockCancelBeautify,
    handleConfirm: mockHandleConfirm,
    handleAccept: mockHandleAccept,
    handleReject: mockHandleReject,
    handleRetry: mockHandleRetry,
    handleDismiss: mockHandleDismiss,
  }),
}));

// Mock useAutoSave hook to prevent auto-save timer issues
vi.mock('@/hooks/useAutoSave', () => ({
  useAutoSave: () => ({
    hasUnsavedChanges: false,
    isSaving: false,
    saveError: null,
    lastSaved: null,
    save: vi.fn().mockResolvedValue(undefined),
  }),
}));

// Mock PreviewRenderer to prevent iframe issues
vi.mock('@/components/PreviewRenderer', () => ({
  PreviewRenderer: ({ html, css }: { html: string; css: string }) => (
    <div data-testid="mock-preview-renderer">
      <iframe title="preview" data-html={html} data-css={css} />
    </div>
  ),
}));

// Mock AppHeader and AppFooter
vi.mock('@/components/layout', () => ({
  AppHeader: () => <header data-testid="mock-app-header">Header</header>,
  AppFooter: () => <footer data-testid="mock-app-footer">Footer</footer>,
}));

// Mock common components
vi.mock('@/components/common', () => ({
  LoadingSpinner: ({ message }: { message?: string }) => <div data-testid="loading-spinner">{message}</div>,
  ErrorMessage: ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
    <div data-testid="error-message">
      {message}
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  ),
  WebsiteNotFound: () => (
    <div data-testid="website-not-found">
      Website not found
      <button>Back to Dashboard</button>
    </div>
  ),
}));

// Mock DownloadDialog
vi.mock('@/components/DownloadDialog', () => ({
  DownloadDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div role="dialog" data-testid="download-dialog">Download Dialog</div> : null,
}));

// Mock beautify components
vi.mock('@/components/beautify', () => ({
  BeautifyButton: ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled} data-testid="beautify-button">Beautify</button>
  ),
  BeautifyOptionsDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div role="dialog" data-testid="beautify-options-dialog">Options Dialog</div> : null,
  BeautifyLoadingOverlay: ({ isVisible }: { isVisible: boolean }) =>
    isVisible ? <div data-testid="beautify-loading">Loading...</div> : null,
  PreviewComparison: () => <div data-testid="preview-comparison">Preview Comparison</div>,
  SaveOptionsDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div role="dialog" data-testid="save-options-dialog">Save Options</div> : null,
  BeautifyErrorDisplay: ({ error }: { error: { message: string } }) => (
    <div data-testid="beautify-error">{error.message}</div>
  ),
}));

// Mock icon components
vi.mock('@/components/icons', () => ({
  ArrowLeftIcon: ({ className }: { className?: string }) => <svg aria-hidden="true" className={className} data-testid="arrow-left-icon" />,
  DownloadIcon: ({ className }: { className?: string }) => <svg aria-hidden="true" className={className} data-testid="download-icon" />,
  CheckIcon: ({ className }: { className?: string }) => <svg aria-hidden="true" className={className} data-testid="check-icon" />,
  CodeIcon: ({ className }: { className?: string }) => <svg aria-hidden="true" className={className} data-testid="code-icon" />,
  PanelRightIcon: ({ className }: { className?: string }) => <svg aria-hidden="true" className={className} data-testid="panel-right-icon" />,
  MaximizeIcon: ({ className }: { className?: string }) => <svg aria-hidden="true" className={className} data-testid="maximize-icon" />,
  MinimizeIcon: ({ className }: { className?: string }) => <svg aria-hidden="true" className={className} data-testid="minimize-icon" />,
  GlobeIcon: ({ className }: { className?: string }) => <svg aria-hidden="true" className={className} data-testid="globe-icon" />,
}));

// Helper to create a mock website
function createMockWebsite(id: string, overrides?: Partial<GeneratedWebsite>): GeneratedWebsite {
  return {
    id,
    userId: 'test-user-123',
    title: `Test Website ${id}`,
    html: '<h1>Test Content</h1><p>Hello World</p>',
    css: 'h1 { color: blue; } p { font-size: 16px; }',
    thumbnailUrl: 'data:image/png;base64,test',
    inputType: 'text',
    originalPrompt: 'Create a test website',
    isPublic: true,
    isShowcased: false,
    showcasedAt: null,
    creatorName: 'Test User',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

// Create a Promise-wrapped params object as required by Next.js 15+
function createParamsPromise(id: string): Promise<{ id: string }> {
  return Promise.resolve({ id });
}

// Import the page component after mocks are set up
import WebsitePage from './page';

// Wrapper component to handle Suspense boundaries properly in tests
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  );
}

// Helper function to render the page with proper async handling
async function renderWebsitePage(websiteId: string) {
  let result;
  await act(async () => {
    result = render(
      <TestWrapper>
        <WebsitePage params={createParamsPromise(websiteId)} />
      </TestWrapper>
    );
  });
  return result!;
}

describe('Website Preview Page Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetIdToken.mockResolvedValue('mock-id-token');
    mockGetById.mockResolvedValue(createMockWebsite('test-website-123'));
    mockUpdate.mockResolvedValue(undefined);
    mockToggleShowcase.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Page Rendering', () => {
    it('renders the page with website title', async () => {
      await renderWebsitePage('test-website-123');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /test website test-website-123/i })).toBeInTheDocument();
      });
    });

    it('shows not found message when website does not exist', async () => {
      mockGetById.mockResolvedValue(null);

      await renderWebsitePage('nonexistent-id');

      await waitFor(() => {
        expect(screen.getByTestId('website-not-found')).toBeInTheDocument();
      });
    });

    it('shows not found message when user does not own the website', async () => {
      mockGetById.mockResolvedValue(createMockWebsite('other-website', { userId: 'other-user-456' }));

      await renderWebsitePage('other-website');

      await waitFor(() => {
        expect(screen.getByTestId('website-not-found')).toBeInTheDocument();
      });
    });

    it('shows error message when fetch fails', async () => {
      mockGetById.mockRejectedValue(new Error('Failed to load website'));

      await renderWebsitePage('test-website-123');

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText(/failed to load website/i)).toBeInTheDocument();
      });
    });
  });

  describe('Icons Module Integration', () => {
    it('renders icons with aria-hidden for accessibility', async () => {
      await renderWebsitePage('test-website-123');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /test website test-website-123/i })).toBeInTheDocument();
      });

      // All SVG icons should have aria-hidden
      const svgs = document.querySelectorAll('svg');
      svgs.forEach((svg) => {
        expect(svg).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('renders ArrowLeftIcon in back to dashboard button', async () => {
      await renderWebsitePage('test-website-123');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /test website test-website-123/i })).toBeInTheDocument();
      });

      expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
    });

    it('renders DownloadIcon in download button', async () => {
      await renderWebsitePage('test-website-123');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /test website test-website-123/i })).toBeInTheDocument();
      });

      expect(screen.getByTestId('download-icon')).toBeInTheDocument();
    });

    it('renders GlobeIcon in share button', async () => {
      await renderWebsitePage('test-website-123');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /test website test-website-123/i })).toBeInTheDocument();
      });

      expect(screen.getByTestId('globe-icon')).toBeInTheDocument();
    });
  });

  describe('Preview Functionality', () => {
    it('displays preview renderer with website content', async () => {
      await renderWebsitePage('test-website-123');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /test website test-website-123/i })).toBeInTheDocument();
      });

      expect(screen.getByTestId('mock-preview-renderer')).toBeInTheDocument();
    });

    it('opens fullscreen preview when preview button is clicked', async () => {
      await renderWebsitePage('test-website-123');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /test website test-website-123/i })).toBeInTheDocument();
      });

      const previewButton = screen.getByRole('button', { name: /preview/i });
      fireEvent.click(previewButton);

      // Should show fullscreen dialog
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Beautify Workflow', () => {
    it('displays beautify button in action toolbar', async () => {
      await renderWebsitePage('test-website-123');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /test website test-website-123/i })).toBeInTheDocument();
      });

      expect(screen.getByTestId('beautify-button')).toBeInTheDocument();
    });

    it('calls openOptionsDialog when beautify button is clicked', async () => {
      await renderWebsitePage('test-website-123');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /test website test-website-123/i })).toBeInTheDocument();
      });

      const beautifyButton = screen.getByTestId('beautify-button');
      fireEvent.click(beautifyButton);

      expect(mockOpenOptionsDialog).toHaveBeenCalled();
    });
  });

  describe('Loading and Error States', () => {
    it('allows retry after fetch error', async () => {
      mockGetById
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(createMockWebsite('test-website-123'));

      await renderWebsitePage('test-website-123');

      // Wait for error
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      // Should load successfully
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /test website test-website-123/i })).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates back to dashboard when back button is clicked', async () => {
      await renderWebsitePage('test-website-123');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /test website test-website-123/i })).toBeInTheDocument();
      });

      const backButton = screen.getByLabelText(/back to dashboard/i);
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Showcase Toggle', () => {
    it('toggles showcase status when share button is clicked', async () => {
      await renderWebsitePage('test-website-123');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /test website test-website-123/i })).toBeInTheDocument();
      });

      const shareButton = screen.getByRole('button', { name: /share/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockToggleShowcase).toHaveBeenCalledWith('test-website-123', true);
      });
    });

    it('shows "Shared" text when website is showcased', async () => {
      mockGetById.mockResolvedValue(createMockWebsite('test-website-123', { isShowcased: true }));

      await renderWebsitePage('test-website-123');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /test website test-website-123/i })).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /shared/i })).toBeInTheDocument();
    });
  });

  describe('Download Dialog', () => {
    it('opens download dialog when download button is clicked', async () => {
      await renderWebsitePage('test-website-123');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /test website test-website-123/i })).toBeInTheDocument();
      });

      const downloadButton = screen.getByRole('button', { name: /download/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByTestId('download-dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Code Editor', () => {
    it('displays code editor panel', async () => {
      await renderWebsitePage('test-website-123');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /test website test-website-123/i })).toBeInTheDocument();
      });

      expect(screen.getByTestId('mock-code-editor')).toBeInTheDocument();
    });

    it('collapses code panel when collapse button is clicked', async () => {
      await renderWebsitePage('test-website-123');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /test website test-website-123/i })).toBeInTheDocument();
      });

      // Find and click collapse button
      const collapseButton = screen.getByLabelText(/collapse code panel/i);
      fireEvent.click(collapseButton);

      // Should show expand button instead
      await waitFor(() => {
        expect(screen.getByLabelText(/expand code panel/i)).toBeInTheDocument();
      });
    });
  });

  describe('Save Status', () => {
    it('displays website creation date', async () => {
      await renderWebsitePage('test-website-123');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /test website test-website-123/i })).toBeInTheDocument();
      });

      expect(screen.getByText(/created/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels for interactive elements', async () => {
      await renderWebsitePage('test-website-123');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /test website test-website-123/i })).toBeInTheDocument();
      });

      // Verify key interactive elements have accessible names
      expect(screen.getByLabelText(/back to dashboard/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument();
    });
  });
});
