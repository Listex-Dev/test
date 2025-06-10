/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com', 'images.pexels.com'],
  },
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig