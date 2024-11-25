/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "www.loginradius.com" }],
  },
};

export default nextConfig;
