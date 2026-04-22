/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // We let <img> tags load from the backend directly
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '5000', pathname: '/**' }
    ]
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://vistora-ai-1.onrender.com'
  }
};

module.exports = nextConfig;
