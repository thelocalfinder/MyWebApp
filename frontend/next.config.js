/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['via.placeholder.com', 'genattire-eg.myshopify.com'],
  },
  typescript: {
    ignoreBuildErrors: true
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://mywebapp-1745023961.azurewebsites.net/api'
  }
}

module.exports = nextConfig 