import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['pathos-images.s3.ap-northeast-2.amazonaws.com', 'example.com'],
  },
};

export default nextConfig;
