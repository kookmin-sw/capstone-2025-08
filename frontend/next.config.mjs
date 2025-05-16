/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/capstone-2025-08' : '';
const assetPrefix = isProd ? '/capstone-2025-08/' : '';

const nextConfig = {
  basePath,
  assetPrefix,
  output: 'export',
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
