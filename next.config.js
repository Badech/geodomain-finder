/** @type {import('next').NextConfig} */
const nextConfig = {
  // Preserve exact output behavior
  reactStrictMode: true,
  // Disable image optimization to preserve original behavior
  images: {
    unoptimized: true,
  },
  // Enable SWC minification for better performance
  swcMinify: true,
  // Preserve environment handling
  env: {},
  // Suppress warnings about missing types
  typescript: {
    // Don't fail build on type errors during migration
    ignoreBuildErrors: false,
  },
  eslint: {
    // Don't fail build on lint errors during migration  
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
