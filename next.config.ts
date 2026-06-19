import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Forces Next.js to handle the ESM compilation of these packages.
   * Fixes require() of ES Module errors with firebase-admin dependencies.
   */
  transpilePackages: ['firebase-admin', 'jwks-rsa', 'jose'],
};

export default nextConfig;
