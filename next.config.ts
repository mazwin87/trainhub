import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  trailingSlash: true,

  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  allowedDevOrigins: [
    'http://localhost:3000',
    'http://192.168.50.40:3000',
  ],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig