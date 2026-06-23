import '@testing-library/jest-dom/vitest';
import { vi, afterEach } from 'vitest';

// ============================================================================
// Global Firebase Mock - MUST be before any module imports
// ============================================================================
// This prevents Firebase SDK from initializing with invalid credentials
vi.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn((callback: (user: unknown) => void) => {
      callback(null);
      return vi.fn(); // unsubscribe
    }),
  },
  googleProvider: {
    providerId: 'google.com',
    setCustomParameters: vi.fn(),
  },
  db: {},
  default: {},
}));

// Mock Firebase Auth module to prevent initialization
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
    onAuthStateChanged: vi.fn(),
  })),
  GoogleAuthProvider: vi.fn(() => ({
    providerId: 'google.com',
    setCustomParameters: vi.fn(),
  })),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth: unknown, callback: (user: unknown) => void) => {
    callback(null);
    return vi.fn();
  }),
}));

// Mock Firebase App module
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => [{}]),
  getApp: vi.fn(() => ({})),
}));

// Mock Firebase Firestore module
vi.mock('firebase/firestore', () => {
  // Create a mock Timestamp class that can be used with instanceof checks
  class MockTimestamp {
    seconds: number;
    nanoseconds: number;
    constructor(seconds: number, nanoseconds: number = 0) {
      this.seconds = seconds;
      this.nanoseconds = nanoseconds;
    }
    toDate() {
      return new Date(this.seconds * 1000);
    }
    static now() {
      const now = new Date();
      return new MockTimestamp(Math.floor(now.getTime() / 1000), 0);
    }
    static fromDate(date: Date) {
      return new MockTimestamp(Math.floor(date.getTime() / 1000), 0);
    }
  }

  return {
    getFirestore: vi.fn(() => ({})),
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    addDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    startAfter: vi.fn(),
    Timestamp: MockTimestamp,
  };
});

// ============================================================================
// Mock Monaco Editor - Prevents hanging tests
// ============================================================================
vi.mock('@monaco-editor/react', () => {
  return {
    default: function MockEditor({ value, onChange }: { value?: string; onChange?: (val: string | undefined) => void }) {
      return {
        type: 'textarea',
        props: {
          'data-testid': 'mock-monaco-editor',
          value: value || '',
          onChange: (e: { target: { value: string } }) => onChange?.(e.target.value),
        },
      };
    },
  };
});

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver for components that use it
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// Mock IntersectionObserver for lazy loading components
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => [] as IntersectionObserverEntry[]);

  constructor(
    _callback: IntersectionObserverCallback,
    _options?: IntersectionObserverInit
  ) {}
}
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock URL.createObjectURL for file upload tests
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
