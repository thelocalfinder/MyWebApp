/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['via.placeholder.com', 'genattire-eg.myshopify.com'],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://mywebapp-1745023961.azurewebsites.net/api'
  },
  // Add Azure Web App specific configuration
  poweredByHeader: false,
  generateEtags: false,
  distDir: '.next'
}

module.exports = nextConfig 