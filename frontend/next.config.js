/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'plus.unsplash.com', 'mywebappimages.blob.core.windows.net'],
  },
  typescript: {
    ignoreBuildErrors: true
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://mywebapp-1745023961.azurewebsites.net/api'
  },
  // Azure Web App configuration
  poweredByHeader: false,
  generateEtags: false,
  distDir: '.next',
  // Ensure proper handling of static files
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : ''
}

module.exports = nextConfig 