/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/capstone-2025-08',
  assetPrefix: '/capstone-2025-08/',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
