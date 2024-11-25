/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/account123/**",
      },
      {
        protocol: "https",
        hostname: "www.loginradius.com",
        port: "",
        pathname: "/blog/**",
      },
      {
        protocol: "https",
        hostname: "s38924.pcdn.co",
        port: "",
        pathname: "/wp-content/**",
      },
    ],
  },
  // output: "export",
  // basePath: "/wdm",
};

module.exports = nextConfig;
