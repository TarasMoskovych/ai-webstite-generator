/**
 * Firebase Admin SDK Configuration
 *
 * This module initializes Firebase Admin for server-side operations.
 * Used for verifying Firebase ID tokens in API routes.
 *
 * Requirements: 14.1 - Authentication required for protected routes
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

// Cached instances
let adminApp: App | null = null;
let adminAuthInstance: Auth | null = null;

/**
 * Checks if Firebase Admin SDK credentials are configured.
 *
 * @returns true if all required environment variables are present
 */
function hasFirebaseAdminCredentials(): boolean {
  return !!(
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY
  );
}

/**
 * Initialize Firebase Admin SDK (singleton pattern, lazy initialization)
 * Uses FIREBASE_ADMIN_* environment variables for configuration.
 *
 * Required environment variables:
 * - FIREBASE_ADMIN_PROJECT_ID: Firebase project ID
 * - FIREBASE_ADMIN_CLIENT_EMAIL: Service account email
 * - FIREBASE_ADMIN_PRIVATE_KEY: Service account private key (with \n for newlines)
 *
 * @returns The Firebase Admin App instance
 * @throws Error if credentials are not configured
 */
function getFirebaseAdminApp(): App {
  // Return existing app if already initialized
  if (adminApp) {
    return adminApp;
  }

  // Check for existing apps (in case of multiple module loads)
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  // Validate required environment variables
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin SDK credentials are not configured. ' +
        'Required environment variables: ' +
        'FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY'
    );
  }

  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      // Handle escaped newlines in the private key
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });

  return adminApp;
}

/**
 * Gets the Firebase Admin Auth instance for token verification.
 * Lazy initialization to avoid build-time errors when env vars are not set.
 *
 * @returns The Firebase Admin Auth instance
 * @throws Error if credentials are not configured
 */
export function getAdminAuth(): Auth {
  if (adminAuthInstance) {
    return adminAuthInstance;
  }

  const app = getFirebaseAdminApp();
  adminAuthInstance = getAuth(app);
  return adminAuthInstance;
}

/**
 * Verifies a Firebase ID token and returns the decoded token.
 * This is the main function to use for authentication in API routes.
 *
 * @param idToken - The Firebase ID token to verify
 * @returns The decoded token with user information
 * @throws Error if verification fails or credentials are not configured
 */
export async function verifyIdToken(idToken: string) {
  const auth = getAdminAuth();
  return auth.verifyIdToken(idToken);
}

/**
 * Checks if Firebase Admin is properly configured.
 * Use this to gracefully handle missing credentials.
 *
 * @returns true if Firebase Admin can be initialized
 */
export function isFirebaseAdminConfigured(): boolean {
  return hasFirebaseAdminCredentials();
}

export default getFirebaseAdminApp;
