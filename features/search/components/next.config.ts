import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: '/hrdc',
  assetPrefix: '/hrdc',

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

  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig