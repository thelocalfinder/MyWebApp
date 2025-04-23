/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    domains: ['via.placeholder.com', 'genattire-eg.myshopify.com'],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://mywebapp-1745023961.azurewebsites.net/api'
  }
}

module.exports = nextConfig 