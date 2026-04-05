/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['github-issue-tracker-pied.vercel.app'],
    },
  },
}

export default nextConfig