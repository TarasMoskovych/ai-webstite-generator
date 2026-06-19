import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'firebase-admin',
    'firebase-admin/app',   // Bypasses bundling for initializeApp, cert, App
    'firebase-admin/auth',  // Bypasses bundling for getAuth, Auth
    'jwks-rsa',             // Fixes ESM/CJS conflict - uses require('jose')
    'jose',                 // ESM-only package that can't be require()'d
    'sharp',
  ],
};

export default nextConfig;
